# Java Skill Evals

This directory contains a first practical Promptfoo eval suite for the Java agent skills in this repository. The suite checks whether an LLM or agent applies the skill rules to small Java tasks and code review scenarios.

The cases load each skill from the repository's existing `SKILL.md` files through Promptfoo `file://` variables. Do not copy full skill text into eval cases.

## What Is Covered

The initial suite focuses on rules that are concrete enough to evaluate consistently:

- `java-testing-style`: parameterized Bean Validation tests, JUnit Jupiter assertions, test naming, and `actual` result variables.
- `java-readable-code`: avoiding `Optional` parameters and production API that exists only for tests.
- `java-domain-clarification`: asking questions before coding ambiguous domain scoping.
- `java-clean-architecture`: respecting the activation guard.
- `java-spring-security`: controller boundary authorization and capability authorities.
- `java-flyway-migrations`: timestamp migrations, applied migration integrity, and startup/Flyway validation.

## Assertions

Prefer deterministic assertions first:

- `contains` and `icontains` for required stable tokens.
- `not-regex` for forbidden code shapes such as `@BeforeEach` or `hasRole(...)`.
- `regex` for flexible but concrete patterns such as timestamp migration filenames.

Use `llm-rubric` only when exact text matching would be too brittle, such as checking that an answer asks clarification questions before implementation or explains why a guarded skill is inactive. Keep rubrics strict and short.

## Run Locally

From the repository root:

```bash
nvm install
nvm use
```

The default config uses `file://providers/codex-cli-auth.mjs`, a thin local Promptfoo provider that calls `@openai/codex-sdk` without requiring an API key. Sign in to Codex with ChatGPT before running the suite:

```bash
codex login
unset OPENAI_API_KEY CODEX_API_KEY PROMPTFOO_EVAL_PROVIDER PROMPTFOO_GRADER_PROVIDER
npm exec --yes --package promptfoo@latest --package @openai/codex-sdk@latest -- \
  promptfoo eval -c evals/promptfooconfig.yaml
```

Keep `OPENAI_API_KEY`, `CODEX_API_KEY`, `PROMPTFOO_EVAL_PROVIDER`, and `PROMPTFOO_GRADER_PROVIDER` unset when you want this suite to use the local Codex CLI auth provider with your existing ChatGPT login. The default config pins `gpt-5.5`, so the command forces `@openai/codex-sdk@latest`; older SDK caches can reject this model with a "requires a newer version of Codex" error. The config also uses `sandbox_mode: read-only`, so the eval can inspect the repository without writing files. The upstream Promptfoo `openai:codex-sdk` provider currently requires an API key before it starts the SDK, so this suite uses the local provider instead.

The local provider passes `CODEX_HOME` through to the Codex SDK process. If `CODEX_HOME` is not set and `~/.codex/auth.json` does not exist, it also looks for IDE-managed Codex auth under `~/.cache/JetBrains/*/aia/codex`.
If the auth home is not writable, the provider seeds a private runtime Codex home under `/tmp/promptfoo-codex-home` so `codex exec` can write sessions and logs without modifying the original auth directory.

For a different Codex model, keep the provider id unchanged and set `PROMPTFOO_CODEX_MODEL`:

```bash
unset OPENAI_API_KEY CODEX_API_KEY PROMPTFOO_EVAL_PROVIDER PROMPTFOO_GRADER_PROVIDER
PROMPTFOO_CODEX_MODEL=gpt-5.5 \
npm exec --yes --package promptfoo@latest --package @openai/codex-sdk@latest -- \
  promptfoo eval -c evals/promptfooconfig.yaml
```

If either API key environment variable is set, the Codex SDK can authenticate through API-key billing instead.

### Use OpenAI API billing

Use the API config when you intentionally want normal OpenAI API credentials:

```bash
export OPENAI_API_KEY=your_api_key_here
npx promptfoo eval -c evals/promptfooconfig.api.yaml
```

The API eval and grader provider defaults to `openai:chat:gpt-5.5`. Override it without editing the config when you need to use another API-compatible provider or model:

```bash
PROMPTFOO_EVAL_PROVIDER=<promptfoo-provider-id> \
PROMPTFOO_GRADER_PROVIDER=<promptfoo-provider-id> \
npx promptfoo eval -c evals/promptfooconfig.api.yaml
```

If you hit retryable rate limits or queue timeout errors, lower Promptfoo concurrency and add a delay between tests:

```bash
npx promptfoo eval -c evals/promptfooconfig.yaml --max-concurrency 1 --delay 10000
```

If the error says `insufficient_quota`, `billing_hard_limit_reached`, or that your Codex usage limit has been reached, retries, lower concurrency, and delay will not help. Use an account with available quota, wait for limits to reset, or switch configs/providers.

If you see `401 Unauthorized: Missing bearer or basic authentication`, promptfoo could not find usable Codex auth. Check that `OPENAI_API_KEY`, `CODEX_API_KEY`, `PROMPTFOO_EVAL_PROVIDER`, and `PROMPTFOO_GRADER_PROVIDER` are unset, then run `codex login` again in the same shell. If you want to force the default Codex auth directory, run `env -u CODEX_HOME codex login`.

If you see a model error such as `gpt-5.5 requires a newer version of Codex`, make sure you are running the command above with `@openai/codex-sdk@latest` and Node from `.nvmrc`.

This repository pins Node `22.22.0` in `.nvmrc`. Current Promptfoo versions require Node `^20.20.0` or `>=22.22.0`; older Node 22 patch releases such as `22.13.1` fail before loading the eval config.

The default provider config in `evals/promptfooconfig.yaml` uses Codex CLI auth through the local provider:

```yaml
providers:
  - id: "{{ env.EVAL_PROVIDER }}"
    config:
      working_dir: ..
      model: "{{ env.CODEX_MODEL }}"
      sandbox_mode: read-only
defaultTest:
  options:
    provider:
      id: "{{ env.GRADER_PROVIDER }}"
```

If a model is not available in your account, set `PROMPTFOO_CODEX_MODEL` to one that is.

Use `evals/promptfooconfig.api.yaml` for OpenAI API chat providers. The Codex SDK provider has a different, strict config shape, so API chat-completion settings live in the API config instead.

View the latest run:

```bash
npx promptfoo view
```

Promptfoo also supports other providers. Keep provider-specific secrets in environment variables or local config, not in this repository.

## Add A New Skill Eval

1. Add a case under `evals/cases/<skill-name>/<case-name>.yaml`.
2. Set `description` and `metadata.id` to `<skill-name>:<case-name>`.
3. Set `metadata.skill` to the skill directory name.
4. Choose `apply-skill` for task-oriented cases or `review-code` for code-review cases.
5. Load the skill with `skill: file://../<skill-name>/SKILL.md`.
6. Add the smallest Java snippet that exercises the rule.
7. Start with deterministic checks. Add `llm-rubric` only for semantic behavior that cannot be asserted robustly with text or regex.

Eval IDs use this convention:

```text
<skill-name>:<short-scenario-name>
```

Example:

```text
java-testing-style:bean-validation-parameterized
```

## CI Guidance

This repository currently has no package manifest or GitHub Actions setup, so this eval harness does not add CI files. A lightweight GitHub Actions job can be added later if the repository adopts CI:

```yaml
name: Skill evals

on:
  pull_request:
  workflow_dispatch:

jobs:
  promptfoo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
      - run: npx promptfoo eval -c evals/promptfooconfig.api.yaml
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

Run this fast suite on pull requests once credentials and model choice are standardized. Larger patch-based evals or agent trace evals can be added later for end-to-end behavior.
