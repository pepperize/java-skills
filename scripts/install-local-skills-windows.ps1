$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$skillsDir = if ($env:AGENTS_SKILLS_DIR) {
    $env:AGENTS_SKILLS_DIR
} else {
    Join-Path $HOME ".agents\skills"
}

$skills = @(
    "java-clean-architecture",
    "java-ddd-architecture",
    "java-readable-code",
    "java-testing-style",
    "java-solid-review",
    "java-agent-instructions",
    "java-logging-exceptions",
    "java-domain-clarification",
    "java-spring-security",
    "java-flyway-migrations"
)

New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

foreach ($skill in $skills) {
    $source = Join-Path $repoRoot $skill
    $target = Join-Path $skillsDir $skill
    $skillFile = Join-Path $source "SKILL.md"

    if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
        throw "Missing skill: $skillFile"
    }

    if (Test-Path -LiteralPath $target) {
        $existing = Get-Item -LiteralPath $target -Force
        $isLink = ($existing.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0

        if ($isLink) {
            Write-Host "Updating junction: $skill"
            Remove-Item -LiteralPath $target -Force
        } else {
            throw "Refusing to overwrite existing non-link: $target"
        }
    }

    New-Item -ItemType Junction -Path $target -Target $source | Out-Null
    Write-Host "Installed: $skill -> $source"
}

Write-Host ""
Write-Host "Restart Codex to pick up new or changed skills."
