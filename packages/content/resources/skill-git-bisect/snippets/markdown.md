# Git Bisect Cheatsheet

`git bisect` performs a binary search over your commit history to find the commit
that introduced a bug. You tell Git one **bad** commit and one **good** commit;
Git checks out the midpoint and you mark it good or bad. Each answer halves the
remaining range, so even thousands of commits resolve in a handful of steps.

## Core commands

```bash
git bisect start          # begin a bisect session
git bisect bad            # mark the CURRENT commit as bad (bug present)
git bisect good <commit>  # mark a known-good commit (bug absent)
git bisect good           # mark the CURRENT checked-out commit as good
git bisect bad <commit>   # mark a specific commit as bad
git bisect skip           # can't test this commit — skip it
git bisect reset          # end the session, return to original HEAD
```

## Basic manual flow

```bash
# 1. Start and tell Git the boundaries.
git bisect start
git bisect bad                 # HEAD is broken
git bisect good v1.4.0         # this tag/commit worked

# 2. Git checks out a midpoint commit. Test it, then mark it:
git bisect good                # if the bug is NOT present here
# ...or...
git bisect bad                 # if the bug IS present here

# 3. Repeat until Git prints the first bad commit, e.g.:
#    a1b2c3d is the first bad commit

# 4. Clean up — go back to where you started.
git bisect reset
```

You can also pass both boundaries on the start line:

```bash
git bisect start <bad> <good>
# example:
git bisect start HEAD v1.4.0
```

## Automate with a test script (`git bisect run`)

`git bisect run` runs a command at each step and reads its **exit code**:

- exit `0` → commit is **good**
- exit `1`–`124`, `126`, `127` → commit is **bad**
- exit `125` → commit should be **skipped** (cannot be tested)
- any exit `>= 128` aborts the bisect

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.4.0
git bisect run ./test.sh        # runs at every step, fully unattended
git bisect reset                # after it reports the first bad commit
```

Run an existing test suite directly:

```bash
git bisect run npm test
git bisect run pytest -x tests/test_login.py
git bisect run make check
```

Run a single command and treat a non-zero exit as "bad":

```bash
git bisect run sh -c 'grep -q "expected output" <(./build-and-run.sh)'
```

### Example test script

```bash
#!/usr/bin/env bash
# test.sh — exit 0 = good, 1 = bad, 125 = skip (untestable build)

# Build; if the build itself is broken, skip this commit instead of blaming it.
make build || exit 125

# Run the focused check that reproduces the bug.
./run-check || exit 1

exit 0
```

```bash
chmod +x test.sh   # make sure it is executable before `git bisect run`
```

## Skipping untestable commits

Use `skip` when a commit cannot be judged (won't build, missing data, etc.):

```bash
git bisect skip                       # skip the current commit
git bisect skip <commit>              # skip a specific commit
git bisect skip v2.0..v2.1            # skip a whole range
```

When skips prevent an exact answer, Git reports the smallest range still
containing the first bad commit.

## Inspecting and resetting

```bash
git bisect log                        # show the bisect session so far
git bisect log > bisect.log           # save it to replay later
git bisect replay bisect.log          # re-run a saved/edited session
git bisect visualize                  # open gitk on the remaining range
git bisect view                       # alias for visualize
git bisect reset                      # finish: restore the original HEAD
git bisect reset <commit>             # finish AND check out a specific commit
```

## Common workflows

### 1. Find a regression between two tags, manually

```bash
git bisect start
git bisect bad v3.0.0
git bisect good v2.9.0
# Git checks out a midpoint each round — test the app and answer:
git bisect good   # or: git bisect bad
# ...repeat until Git names the first bad commit...
git bisect reset
```

### 2. Fully automated with a unit test

```bash
git bisect start HEAD v2.9.0          # bad good in one line
git bisect run npm test -- login.spec.js
# Git prints "<sha> is the first bad commit"
git show <sha>                        # inspect the offending change
git bisect reset
```

### 3. Bisect a flaky/expensive build with skips

```bash
git bisect start
git bisect bad
git bisect good HEAD~200
git bisect run ./test.sh              # test.sh exits 125 when build fails -> auto-skip
git bisect reset
```

### 4. Save, abort, and resume later

```bash
git bisect start
git bisect bad
git bisect good v1.0
git bisect good                       # a few rounds in...
git bisect log > bisect.log           # checkpoint
git bisect reset                      # stop for now

# later — pick up exactly where you left off:
git bisect replay bisect.log
```

## Gotchas / tips

- **`good`/`bad` are just labels.** For non-regression searches (e.g. "when did
  this get *fixed*?") use custom terms: `git bisect start --term-old=fixed
  --term-new=broken`, then mark with `git bisect fixed` / `git bisect broken`.
- **Always `git bisect reset` when done** — otherwise you stay on a detached
  midpoint commit and your working tree looks "wrong".
- **Commit or stash local changes first.** Bisect checks out different commits;
  a dirty working tree blocks the checkout.
- **Exit code 125 means skip, not bad.** Use it in scripts for commits that
  won't build so a broken build is never mistaken for the bug.
- **Keep the test fast and deterministic.** `git bisect run` calls it once per
  step; flaky tests give wrong verdicts. Reproduce the bug with the tightest
  possible check.
- **The "good" commit must actually be good.** If you pick a good commit that is
  already broken, bisect will point at the wrong place.
- **Rebuild side effects can leak.** If artifacts persist between checkouts, add
  a clean step (e.g. `make clean`, `rm -rf node_modules/.cache`) inside the
  script to avoid false results.
