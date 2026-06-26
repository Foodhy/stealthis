# PR Review Checklist

A practical reference for reviewing pull requests. Reviewing well means more than
spotting bugs — it is checking correctness, tests, security, readability, scope,
and naming, then delivering feedback that is kind and actionable. Run the
checklist top to bottom, prefix comments with their severity, and approve once the
blocking items are clear.

## Correctness

Does the code do what the PR description claims, including the edge cases?

- [ ] The change matches the stated goal / linked issue.
- [ ] Edge cases handled: empty input, nulls, zero, very large values, concurrency.
- [ ] Error paths are handled, not swallowed; failures surface or log.
- [ ] No off-by-one, inverted conditions, or wrong operator precedence.
- [ ] External calls (network, DB, FS) handle timeouts and failures.

Pull the branch and run it when logic is non-trivial:

```bash
git fetch origin
git switch pr-branch        # or: gh pr checkout 123
# run the app / the specific path the PR touches
```

## Tests

New behavior needs proof; changed behavior needs updated proof.

- [ ] New logic has tests; bug fixes include a regression test.
- [ ] Tests assert behavior, not implementation details.
- [ ] Both happy path and at least one failure/edge case are covered.
- [ ] Tests are deterministic (no real time, randomness, or network).

Run the suite and check coverage of the changed lines:

```bash
# pick your runner
npm test
pytest -q
go test ./...
```

```bash
# diff-scoped coverage, where supported
pytest --cov=. --cov-report=term-missing
```

## Security

Treat every input as hostile until validated.

- [ ] User input is validated and escaped; no string-built SQL or shell.
- [ ] No secrets, tokens, or keys committed (check the diff, not just files).
- [ ] AuthZ/AuthN checks present on new endpoints and resources.
- [ ] Dependencies added are reputable and pinned; no unexpected packages.
- [ ] PII is not logged; sensitive data is not returned in responses.

Quick scans before approving:

```bash
# secrets in the diff
git diff origin/main... | grep -niE 'api[_-]?key|secret|token|password|BEGIN .*PRIVATE KEY'
```

```bash
# audit newly added dependencies
npm audit --omit=dev
pip-audit
```

## Readability

Code is read far more than it is written.

- [ ] Functions are small and do one thing; nesting is shallow.
- [ ] Control flow is easy to follow; early returns over deep `if/else`.
- [ ] Comments explain *why*, not *what* the code already says.
- [ ] No dead code, commented-out blocks, or stray debug logging.
- [ ] Formatting matches the project linter (run it, do not eyeball it).

```bash
npm run lint
ruff check .
gofmt -l .
```

## Scope

A focused PR is faster to review and safer to revert.

- [ ] The PR does one thing; unrelated refactors are split out.
- [ ] No drive-by changes hidden in a feature PR.
- [ ] Diff size is reasonable; if huge, ask whether it can be split.
- [ ] Generated files / lockfiles changes are intentional and explained.

```bash
# see the shape of the change at a glance
git diff --stat origin/main...
```

## Naming

Good names remove the need for comments.

- [ ] Names reveal intent: `userCount`, not `n` or `data2`.
- [ ] Booleans read as predicates: `isActive`, `hasAccess`.
- [ ] Consistent with existing project vocabulary and casing.
- [ ] No misleading names (a `get` that mutates, a `list` that returns one).

## Giving kind, actionable feedback

Be specific, assume good intent, and make the fix obvious. Separate taste from
blockers using a shared prefix vocabulary (conventional comments):

```text
nit:        minor / optional, never blocks merge
suggestion: a concrete improvement, author's call
question:   you need info before deciding
issue:      a real problem to address
blocking:   must be resolved before approval
praise:     call out something done well
```

Phrase comments well:

```text
# Instead of:
This is wrong.

# Write:
issue: this throws on an empty list — `items[0]` fails when `items` is empty.
suggestion: guard with `if not items: return None` before indexing.
```

Feedback principles:

- [ ] Critique the code, not the person ("this function" not "you").
- [ ] Ask, don't command, when it is a judgment call ("what about...?").
- [ ] Explain the *why* and offer a path forward, not just the problem.
- [ ] Anchor comments to specific lines, not vague whole-PR remarks.
- [ ] Balance: note at least one thing done well, especially for newer devs.

## Common workflows

### 1. Quick review of a small PR

```bash
gh pr checkout 412
git diff --stat origin/main...
npm test && npm run lint
gh pr review 412 --approve --body "LGTM. One nit inline, non-blocking."
```

### 2. Thorough review of a risky change

```bash
gh pr checkout 530
git diff origin/main... | grep -niE 'secret|token|password'   # secret scan
npm audit --omit=dev                                          # new deps
npm test -- --coverage                                        # tests + coverage
# run the affected path manually, then leave line comments in the UI
gh pr review 530 --request-changes --body "Two blocking items inline re: authZ."
```

### 3. Re-review after the author pushes fixes

```bash
git fetch origin && git switch pr-branch && git pull
git log --oneline origin/main..HEAD     # see what was added
git diff @{1}                           # what changed since your last pull
gh pr review --approve --body "Thanks for the fixes — all resolved."
```

### 4. Reviewing your own PR before requesting review

```bash
git diff origin/main...        # read every line as if it were someone else's
npm test && npm run lint
# add a self-review comment explaining any non-obvious decisions
gh pr ready                    # mark draft as ready once it passes your own bar
```

## Gotchas / tips

- Review in small sittings; quality drops sharply on large diffs read at once.
- Pull and run the branch for anything non-trivial — reading is not testing.
- Distinguish "blocking" from "nit" explicitly so the author can triage fast.
- A green CI is a floor, not a ceiling; passing tests can still test the wrong thing.
- If you have left more than a handful of comments, consider a quick call instead.
- Approve with confidence: if it is better than what is on `main` and the blockers
  are clear, ship it — perfect is the enemy of merged.
- Watch the lockfile and generated files; unexplained churn there hides surprises.
