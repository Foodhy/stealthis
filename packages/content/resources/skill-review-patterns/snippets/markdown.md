# Code Review Patterns Cheatsheet

A practical reference for fast, respectful, high-signal code review. The core
ideas: label your comments so authors know what blocks merge, keep PRs small,
review the diff rather than the author, and treat async review as a courtesy
loop. Copy the templates below into your team docs or PR description.

## Comment labels: nit vs blocker

Prefix every review comment with its severity so the author knows what must
change before merge and what is optional. This removes guesswork and prevents
"reviewer said something, I don't know if I have to do it" stalls.

```text
blocker:   Must fix before merge. Correctness, security, data loss, broken API.
issue:     Should fix. Real problem, but author can push back with reasoning.
nit:       Optional polish. Style/naming/taste. Author may ignore freely.
question:  Not a request — I want to understand. No change implied.
praise:    Positive callout. Reinforce good patterns; costs nothing.
suggestion: Concrete proposed change, often with a code block.
```

Conventional Comments format (one labeled line, then the body):

```text
nit (non-blocking): rename `data` to `userRecords` for clarity.

This reads ambiguously two functions down — but ship it either way if you prefer.
```

```text
blocker: this query runs inside the loop — N+1 on the orders table.

Pull the fetch out and batch by `customer_id`.
```

GitHub supports a `suggestion` block the author can apply in one click:

````text
```suggestion
const total = items.reduce((sum, i) => sum + i.price, 0);
```
````

## Small PRs

Small diffs get reviewed faster, get better feedback, and revert cleanly.
Aim for one logical change per PR.

```text
Target:   < 200-400 lines of meaningful diff
Reviewer: 1 reviewer can hold the whole change in their head
Time:     reviewable in < 30 minutes
Rule:     one PR = one concern (don't mix refactor + feature + formatting)
```

Split a large branch into stacked, reviewable PRs:

```bash
# Each branch builds on the previous; review and merge bottom-up.
git switch -c feat/api-base main
# ... commit base ...
git switch -c feat/api-handler feat/api-base
# ... commit handler ...
git switch -c feat/api-tests feat/api-handler
```

Separate noisy mechanical changes from logic so reviewers see the real diff:

```bash
# PR 1: pure rename / move (no behavior change)
git mv src/util.js src/lib/util.js

# PR 2: the actual logic change on top
```

Tell reviewers how to read large unavoidable diffs:

```text
## Review guide
- Start in `src/auth/session.ts` — the real logic.
- `migrations/` and `*.snap` are generated; skim only.
- Commits are atomic; reviewing commit-by-commit is easier than the full diff.
```

## Review the diff, not the author

Critique the code and behavior, never the person. Use neutral, specific
language and "we"/"the code" instead of "you".

```text
DON'T:  "Why did you write it this way?"
DO:     "This branch can return null when the cache misses — guard it?"

DON'T:  "You forgot error handling."
DO:     "The fetch on line 42 has no catch; a 500 would crash the page."

DON'T:  "This is wrong."
DO:     "I think this breaks when `items` is empty — see the divide on line 9."
```

Ask, don't command, when you might be missing context:

```text
question: is the retry intentional here? If the call is idempotent it's fine;
if not, a duplicate write could slip through.
```

Anchor feedback to the line and a concrete consequence, not a vibe:

```text
issue (line 31): mutating `props.config` mutates the caller's object —
copy it first or downstream renders will see stale state.
```

## Async review etiquette

Most review is asynchronous. Optimize for unblocking the other person.

```text
As AUTHOR:
- Self-review your own diff before requesting a human.
- Write a PR description: what changed, why, how to test.
- Reply to every comment (resolve, push back, or "done in <sha>").
- Re-request review explicitly after pushing fixes; don't assume they'll notice.

As REVIEWER:
- Respond within ~1 business day, even if just "looking this afternoon".
- Batch all comments into one submitted review, not 12 drip notifications.
- Approve with nits ("LGTM, nits optional") instead of blocking on taste.
- If it's big or contentious, switch to a 10-min call, then summarize in the PR.
```

Single-review submission and explicit re-request (GitHub CLI):

```bash
# Reviewer: stage comments, then submit once as a batch.
gh pr review 123 --comment --body "Two blockers inline, rest are nits."

# Author: after pushing fixes, re-request the same reviewers.
gh pr edit 123 --add-reviewer alice,bob
```

Resolve threads only when actually addressed (author resolves, not reviewer):

```text
done in 4f2a9c — extracted the guard and added a test for the null case.
```

## Common workflows

### 1. Author opens a clean, fast-to-review PR

```bash
git switch -c fix/null-session main
# ... make ONE focused change ...
git add -p                       # stage only the relevant hunks
git commit -m "fix: guard null session on cache miss"
git push -u origin fix/null-session
gh pr create --fill --reviewer alice
# Then self-review the diff in the browser before pinging anyone.
```

### 2. Reviewer triages with labeled comments

```bash
gh pr checkout 123               # pull the branch locally to run it
# Leave inline comments prefixed: blocker / issue / nit / question / praise
gh pr review 123 --request-changes --body "1 blocker (N+1 on line 88), rest nits."
```

### 3. Author addresses feedback and re-requests

```bash
git switch fix/null-session
# ... fix the blocker ...
git commit -am "fix: batch order fetch to remove N+1"
git push
# Reply "done in <sha>" on the thread, then:
gh pr edit 123 --add-reviewer alice
```

### 4. Splitting a too-big PR into stacked reviews

```bash
git switch -c refactor/extract-validator main
git mv src/validate.js src/lib/validate.js   # mechanical move only
git commit -m "refactor: move validator (no behavior change)"
gh pr create --fill --title "refactor: move validator (no-op)"
# Then build the feature PR on top of this branch.
```

## Gotchas / tips

```text
- "LGTM" with zero comments on a 600-line PR usually means it wasn't read.
- A nit that hides a blocker gets ignored — split severities into separate comments.
- Don't rewrite the author's solution in your head and demand it; ask why first.
- Approving "with nits" beats a second round-trip for pure style preferences.
- Re-requesting review is a button, not telepathy — press it after every push.
- Force-pushing after review erases inline comment context; prefer fixup commits
  during review, squash at merge.
- Large generated files (lockfiles, snapshots) drown the diff — mark them in a
  .gitattributes `linguist-generated=true` or call them out in the review guide.
- Reviewing is a gift of time; lead with praise where it's earned.
```
