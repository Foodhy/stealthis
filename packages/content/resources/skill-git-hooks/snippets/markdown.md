# Git Hooks Cheatsheet

Git hooks are executable scripts that Git fires at specific moments in its lifecycle. Client-side hooks live in each repo and run on the developer's machine — perfect for linting, formatting, validating commit messages, and running fast tests before code is shared. This cheatsheet covers the hooks you use most, where they live, how to share them with a team, and the popular managers (husky, lefthook).

## Where hooks live

Every repo ships sample hooks in `.git/hooks/`. They are inactive until you create a file with the exact hook name (no extension) and make it executable.

```bash
# list the sample hooks Git created
ls .git/hooks/

# create a hook
touch .git/hooks/pre-commit

# make it executable (required, or Git silently skips it)
chmod +x .git/hooks/pre-commit
```

Notes:

- The file MUST be named exactly (`pre-commit`, `commit-msg`, `pre-push`) with no extension.
- The `.sample` files are templates — Git never runs them.
- Hooks in `.git/hooks/` are NOT committed (the `.git` dir is local). To share, see `core.hooksPath`.

## Client-side hooks at a glance

| Hook | Fires | Exit non-zero | Common use |
|------|-------|---------------|------------|
| `pre-commit` | before the commit is created | aborts commit | lint, format, type-check |
| `prepare-commit-msg` | before the editor opens | aborts commit | inject template/branch name |
| `commit-msg` | after message is written | aborts commit | validate message format |
| `pre-push` | before objects are sent | aborts push | run tests, block protected branch |
| `post-commit` | after the commit is made | (ignored) | notifications, logging |

A hook that exits with a non-zero status cancels the operation (except informational hooks like `post-commit`).

## pre-commit

Runs before the commit object is created. Use it for fast checks on staged files.

```bash
#!/bin/sh
# .git/hooks/pre-commit
# Block commits that contain lint errors.

npm run lint || {
  echo "Lint failed. Commit aborted."
  exit 1
}
```

Run only on staged files (faster):

```bash
#!/bin/sh
# .git/hooks/pre-commit
# Get staged JS/TS files and run eslint on them.

files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$')
[ -z "$files" ] && exit 0

echo "$files" | xargs npx eslint || exit 1
```

Bypass when you must:

```bash
git commit --no-verify -m "wip"
```

## commit-msg

Receives the path to the file holding the commit message as `$1`. Use it to enforce a format such as Conventional Commits.

```bash
#!/bin/sh
# .git/hooks/commit-msg
# Enforce Conventional Commits: type(scope): subject

msg_file="$1"
pattern='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf)(\(.+\))?: .{1,}'

if ! grep -qE "$pattern" "$msg_file"; then
  echo "Commit message must follow Conventional Commits."
  echo "Example: feat(auth): add password reset"
  exit 1
fi
```

## pre-push

Runs before refs are pushed. Reads `<local-ref> <local-sha> <remote-ref> <remote-sha>` lines from stdin. Use it for tests or to protect branches.

```bash
#!/bin/sh
# .git/hooks/pre-push
# Run the test suite before pushing.

npm test || {
  echo "Tests failed. Push aborted."
  exit 1
}
```

Block direct pushes to `main`:

```bash
#!/bin/sh
# .git/hooks/pre-push
# Refuse to push the main branch directly.

protected="main"
while read local_ref local_sha remote_ref remote_sha; do
  if [ "$remote_ref" = "refs/heads/$protected" ]; then
    echo "Direct push to $protected is blocked. Open a PR."
    exit 1
  fi
done
```

Bypass:

```bash
git push --no-verify
```

## Sharing hooks with `core.hooksPath`

Because `.git/hooks/` isn't committed, point Git at a tracked directory instead. Commit your hooks to e.g. `.githooks/` and have each clone opt in once.

```bash
# create a tracked hooks directory
mkdir .githooks
mv .git/hooks/pre-commit .githooks/pre-commit
chmod +x .githooks/pre-commit
git add .githooks
git commit -m "chore: add shared git hooks"

# every teammate runs this once after cloning
git config core.hooksPath .githooks
```

Automate the opt-in with a setup script teammates run after cloning:

```bash
#!/bin/sh
# scripts/setup.sh
git config core.hooksPath .githooks
chmod +x .githooks/*
echo "Git hooks installed."
```

Reset to the default location:

```bash
git config --unset core.hooksPath
```

## Hook managers: husky vs lefthook

Managers wire up `core.hooksPath` for you, keep config in one file, and make hooks installable as part of `npm install`.

### husky (Node, JS/TS projects)

```bash
npm install --save-dev husky
npx husky init          # sets core.hooksPath to .husky/ and adds a prepare script
```

Add a hook by writing a file in `.husky/`:

```bash
# .husky/pre-commit
npx lint-staged
```

The `prepare` script in `package.json` (`"prepare": "husky"`) runs automatically on `npm install`, so hooks self-install for the whole team.

### lefthook (language-agnostic, single YAML config)

```bash
npm install --save-dev lefthook   # or: brew install lefthook
npx lefthook install              # registers hooks via core.hooksPath
```

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{js,ts,css,md}"
      run: npx prettier --check {staged_files}

pre-push:
  commands:
    tests:
      run: npm test
```

Quick comparison:

- **husky** — minimal, Node-centric, one shell file per hook; pairs with `lint-staged`.
- **lefthook** — single YAML, parallel execution, `{staged_files}` templating, works for any language (Go, Ruby, Python, etc.).

## Common workflows

### 1. Lint and format only staged files (husky + lint-staged)

```bash
npm install --save-dev husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### 2. Enforce Conventional Commits team-wide (shared hook)

```bash
mkdir .githooks
cat > .githooks/commit-msg <<'EOF'
#!/bin/sh
pattern='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf)(\(.+\))?: .{1,}'
grep -qE "$pattern" "$1" || { echo "Use Conventional Commits."; exit 1; }
EOF
chmod +x .githooks/commit-msg
git config core.hooksPath .githooks
git add .githooks && git commit -m "chore: add commit-msg hook"
```

### 3. Run tests before every push

```bash
cat > .git/hooks/pre-push <<'EOF'
#!/bin/sh
npm test || exit 1
EOF
chmod +x .git/hooks/pre-push
```

### 4. Cross-language checks with lefthook

```bash
npx lefthook install
# edit lefthook.yml, then verify a single hook without committing:
npx lefthook run pre-commit
```

## Gotchas / tips

- Hooks must be **executable** (`chmod +x`) — a non-executable hook is silently ignored.
- Shebang matters: start with `#!/bin/sh` or `#!/usr/bin/env bash`. On Windows, Git Bash runs them, but plain shell is the safest portable choice.
- Hooks in `.git/hooks/` are **not version-controlled** — use `core.hooksPath` or a manager to share them.
- `--no-verify` (`-n`) skips `pre-commit`, `prepare-commit-msg`, `commit-msg`, and `pre-push`. Don't rely on hooks as your only line of defense — also enforce in CI.
- Keep `pre-commit` fast; run on staged files only. Heavy checks (full test suites) belong in `pre-push` or CI.
- `commit-msg` receives the message file path as `$1`; `pre-push` receives ref info on **stdin**, not arguments.
- `git commit --amend` also triggers `pre-commit` and `commit-msg`.
- A merge commit skips `pre-commit` by default; use `pre-merge-commit` if you need to hook merges.
- Switching managers? Run the new tool's install command — it rewrites `core.hooksPath`, overriding any previous setup.
