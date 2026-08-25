import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROVIDER_NAME = "codex-cli-auth";

export default class CodexCliAuthProvider {
  constructor(options = {}) {
    this.providerId = options.id || `file://providers/${PROVIDER_NAME}.mjs`;
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  toString() {
    return "[Codex CLI Auth Provider]";
  }

  async callApi(prompt, context, callApiOptions) {
    const config = {
      ...this.config,
      ...(context?.prompt?.config || {}),
    };

    try {
      const { Codex } = await loadCodexSdk(config.codex_sdk_path);
      const codex = new Codex(buildCodexOptions(config));
      const thread = config.thread_id
        ? codex.resumeThread(config.thread_id, buildThreadOptions(config))
        : codex.startThread(buildThreadOptions(config));
      const turn = await thread.run(prompt, buildRunOptions(config, callApiOptions));

      return {
        output: turn.finalResponse || "",
        raw: JSON.stringify(turn),
        sessionId: thread.id || "unknown",
        tokenUsage: toPromptfooTokenUsage(turn.usage),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        error: [
          `Error calling ${this.toString()}: ${message}`,
          authDiagnosticSuffix(config, message),
        ].filter(Boolean).join(" "),
      };
    }
  }
}

async function loadCodexSdk(explicitPath) {
  const candidates = getCodexSdkCandidates(explicitPath);
  const attempted = [];

  for (const candidate of candidates) {
    attempted.push(candidate);
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const module = await import(pathToFileURL(candidate).href);
    if (module.Codex) {
      return module;
    }
  }

  throw new Error(
    [
      "Unable to locate @openai/codex-sdk.",
      "Run Promptfoo with `--package @openai/codex-sdk`, install it locally, or set `codex_sdk_path` in the provider config.",
      `Checked: ${attempted.join(", ")}`,
    ].join(" "),
  );
}

function getCodexSdkCandidates(explicitPath) {
  const candidates = [];

  if (explicitPath) {
    candidates.push(toCodexSdkEntry(explicitPath));
  }

  candidates.push(toCodexSdkEntry(path.join(process.cwd(), "node_modules", "@openai", "codex-sdk")));

  for (const base of getAncestorDirectories(process.argv[1]).reverse()) {
    candidates.push(toCodexSdkEntry(path.join(base, "node_modules", "@openai", "codex-sdk")));
  }

  for (const nodePathEntry of (process.env.NODE_PATH || "").split(path.delimiter).filter(Boolean)) {
    candidates.push(toCodexSdkEntry(path.join(nodePathEntry, "@openai", "codex-sdk")));
  }

  return [...new Set(candidates)];
}

function toCodexSdkEntry(candidatePath) {
  if (candidatePath.endsWith(".js") || candidatePath.endsWith(".mjs")) {
    return candidatePath;
  }

  return path.join(candidatePath, "dist", "index.js");
}

function getAncestorDirectories(startPath) {
  if (!startPath) {
    return [];
  }

  let current;
  try {
    current = fs.realpathSync(startPath);
  } catch {
    current = startPath;
  }

  const directories = [];
  current = fs.statSync(current).isDirectory() ? current : path.dirname(current);

  while (true) {
    directories.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      return directories;
    }
    current = parent;
  }
}

function buildCodexOptions(config) {
  const options = {};

  if (config.codex_path_override) {
    options.codexPathOverride = config.codex_path_override;
  }

  if (config.base_url) {
    options.baseUrl = config.base_url;
  }

  const apiKey = config.apiKey || process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    options.apiKey = apiKey;
  }

  options.env = buildCodexEnv(config);

  if (config.codex_config) {
    options.config = config.codex_config;
  }

  return options;
}

export function buildCodexEnv(config = {}) {
  const authHome = resolveCodexAuthHome(config);
  return stripEmptyValues({
    HOME: process.env.HOME,
    PATH: process.env.PATH,
    SHELL: process.env.SHELL,
    TMPDIR: process.env.TMPDIR,
    TEMP: process.env.TEMP,
    TMP: process.env.TMP,
    USER: process.env.USER,
    LOGNAME: process.env.LOGNAME,
    LANG: process.env.LANG,
    LC_ALL: process.env.LC_ALL,
    CODEX_HOME: resolveCodexRuntimeHome(config, authHome),
    CODEX_ACCESS_TOKEN: process.env.CODEX_ACCESS_TOKEN,
    CODEX_CA_CERTIFICATE: process.env.CODEX_CA_CERTIFICATE,
    SSL_CERT_FILE: process.env.SSL_CERT_FILE,
    ...(config.cli_env || {}),
  });
}

export function resolveCodexAuthHome(config = {}) {
  return config.codex_home || process.env.CODEX_HOME || findCodexHomeWithAuth() || defaultCodexHome();
}

function resolveCodexRuntimeHome(config, authHome) {
  if (config.codex_runtime_home) {
    seedCodexRuntimeHome(config.codex_runtime_home, authHome);
    return config.codex_runtime_home;
  }

  if (authHome && isWritableDirectory(authHome)) {
    return authHome;
  }

  return seedCodexRuntimeHome(defaultCodexRuntimeHome(authHome), authHome);
}

function defaultCodexRuntimeHome(authHome) {
  const identity = authHome || defaultCodexHome() || "unknown";
  const hash = crypto.createHash("sha256").update(identity).digest("hex").slice(0, 16);
  return path.join(os.tmpdir(), "promptfoo-codex-home", hash);
}

function seedCodexRuntimeHome(runtimeHome, authHome) {
  fs.mkdirSync(runtimeHome, { recursive: true, mode: 0o700 });
  chmodPrivate(runtimeHome);

  if (!authHome || path.resolve(runtimeHome) === path.resolve(authHome)) {
    return runtimeHome;
  }

  for (const fileName of ["auth.json", "config.toml", "requirements.toml"]) {
    copyIfExists(path.join(authHome, fileName), path.join(runtimeHome, fileName));
  }

  return runtimeHome;
}

function chmodPrivate(targetPath) {
  try {
    fs.chmodSync(targetPath, 0o700);
  } catch {
    // Best effort: some filesystems do not support chmod.
  }
}

function copyIfExists(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.copyFileSync(source, destination);
  try {
    fs.chmodSync(destination, 0o600);
  } catch {
    // Best effort: some filesystems do not support chmod.
  }
}

function isWritableDirectory(directory) {
  if (!directory || !fs.existsSync(directory)) {
    return false;
  }

  try {
    fs.accessSync(directory, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function defaultCodexHome() {
  if (!process.env.HOME) {
    return undefined;
  }

  return path.join(process.env.HOME, ".codex");
}

function findCodexHomeWithAuth() {
  return codexHomeCandidates()
    .filter(hasAuthFile)
    .sort((left, right) => authFileMtimeMs(right) - authFileMtimeMs(left))[0];
}

function codexHomeCandidates() {
  const candidates = [defaultCodexHome()];
  const jetBrainsRoot = process.env.HOME
    ? path.join(process.env.HOME, ".cache", "JetBrains")
    : undefined;

  if (jetBrainsRoot && fs.existsSync(jetBrainsRoot)) {
    for (const productDir of fs.readdirSync(jetBrainsRoot)) {
      candidates.push(path.join(jetBrainsRoot, productDir, "aia", "codex"));
    }
  }

  return [...new Set(candidates.filter(Boolean))];
}

function hasAuthFile(codexHome) {
  return fs.existsSync(path.join(codexHome, "auth.json"));
}

function authFileMtimeMs(codexHome) {
  try {
    return fs.statSync(path.join(codexHome, "auth.json")).mtimeMs;
  } catch {
    return 0;
  }
}

function authDiagnosticSuffix(config, message) {
  if (!isAuthError(message)) {
    return "";
  }

  const authHome = resolveCodexAuthHome(config);
  const runtimeHome = resolveCodexRuntimeHome(config, authHome);
  return [
    "Auth diagnostic:",
    `OPENAI_API_KEY=${isSet(process.env.OPENAI_API_KEY)}`,
    `CODEX_API_KEY=${isSet(process.env.CODEX_API_KEY)}`,
    `CODEX_ACCESS_TOKEN=${isSet(process.env.CODEX_ACCESS_TOKEN)}`,
    `PROMPTFOO_EVAL_PROVIDER=${process.env.PROMPTFOO_EVAL_PROVIDER || "(unset)"}`,
    `auth_home=${authHome || "(unset)"}`,
    `runtime_CODEX_HOME=${runtimeHome || "(unset)"}`,
    `runtime_auth.json=${runtimeHome ? hasAuthFile(runtimeHome) : false}`,
  ].join(" ");
}

function isAuthError(message) {
  return /401|unauthorized|missing bearer|authentication/i.test(message);
}

function isSet(value) {
  return value ? "set" : "unset";
}

function buildThreadOptions(config) {
  return stripEmptyValues({
    workingDirectory: resolveFromConfigBase(config.working_dir, config.basePath),
    skipGitRepoCheck: config.skip_git_repo_check,
    model: config.model,
    additionalDirectories: resolvePathList(config.additional_directories, config.basePath),
    sandboxMode: config.sandbox_mode,
    modelReasoningEffort: config.model_reasoning_effort,
    networkAccessEnabled: config.network_access_enabled,
    webSearchEnabled: config.web_search_enabled,
    approvalPolicy: config.approval_policy,
  });
}

function buildRunOptions(config, callApiOptions) {
  return stripEmptyValues({
    outputSchema: config.output_schema,
    signal: callApiOptions?.abortSignal,
  });
}

function resolvePathList(paths, basePath) {
  if (!Array.isArray(paths)) {
    return undefined;
  }

  return paths.map((entry) => resolveFromConfigBase(entry, basePath));
}

function resolveFromConfigBase(entry, basePath) {
  if (!entry || path.isAbsolute(entry)) {
    return entry;
  }

  return path.resolve(basePath || process.cwd(), entry);
}

function stripEmptyValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function toPromptfooTokenUsage(usage) {
  if (!usage) {
    return undefined;
  }

  const prompt = (usage.input_tokens || 0) + (usage.cached_input_tokens || 0);
  const completion = usage.output_tokens || 0;

  return {
    prompt,
    completion,
    total: prompt + completion,
  };
}
