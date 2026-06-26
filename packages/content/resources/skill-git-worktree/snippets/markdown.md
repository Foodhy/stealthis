# Git Worktree Cheatsheet

`git worktree` attaches extra working directories to one repository. Every worktree
checks out a different branch but shares the same `.git` object database, so you can
work on multiple branches simultaneously without stashing, re-cloning, or switching
back and forth. This is ideal for hotfixes, parallel builds, and side-by-side branch
comparisons.

## Add a worktree

```bash
# Check out an existing branch into a new directory
git worktree add ../myproj-feature feature/login

# Create a NEW branch and a worktree for it in one step (-b)
git worktree add -b hotfix/crash ../myproj-hotfix main

# Worktree from a remote branch (creates a local tracking branch)
git worktree add ../myproj-review origin/release/2.0

# Detached HEAD at a specific commit (no branch)
git worktree add --detach ../myproj-poke v1.4.0
```

A branch can only be checked out in one worktree at a time. Use `-b` (new branch) or
point at a branch not already in use.

## List worktrees

```bash
# Human-readable list of every worktree, its HEAD, and branch
git worktree list

# Machine-readable output for scripts
git worktree list --porcelain
```

Example output:

```text
/home/me/myproj           a1b2c3d [main]
/home/me/myproj-feature   d4e5f6a [feature/login]
/home/me/myproj-hotfix    9f8e7d6 [hotfix/crash]
```

## Remove a worktree

```bash
# Preferred: remove a clean worktree (also unregisters it)
git worktree remove ../myproj-feature

# Force-remove even with uncommitted or untracked changes
git worktree remove --force ../myproj-feature
```

If you delete the directory manually instead of using `remove`, the registration
lingers — clean it up with `prune` (below).

## Parallel branches without stashing

```bash
# You're mid-work on `feature/login` and don't want to stash.
# Open `develop` in a second tree and keep your dirty changes intact.
git worktree add ../myproj-develop develop

# ...do work in ../myproj-develop in a separate terminal/editor...
cd ../myproj-develop
git pull
# build, test, commit here — your feature branch is untouched

# When done, remove it
cd -
git worktree remove ../myproj-develop
```

## Move and lock

```bash
# Relocate a worktree to a new path (updates Git's bookkeeping)
git worktree move ../myproj-hotfix ../archive/myproj-hotfix

# Lock a worktree so prune won't reap it (e.g. on a removable/network drive)
git worktree lock ../myproj-usb --reason "on external SSD"

# Unlock when it's available again
git worktree unlock ../myproj-usb
```

## Prune stale worktrees

```bash
# Preview what would be removed without changing anything
git worktree prune --dry-run --verbose

# Actually remove administrative files for worktrees whose dirs are gone
git worktree prune
```

`prune` only cleans up worktrees whose working directories no longer exist. It does
not touch locked worktrees. Always prefer `git worktree remove` for tidy cleanup;
reach for `prune` after a manual `rm -rf`.

## Common workflows

### 1. Urgent hotfix while mid-feature

```bash
# You're deep in feature/login with uncommitted changes.
# Spin up a clean hotfix tree off main — no stash needed.
git worktree add -b hotfix/payment ../myproj-hotfix main

cd ../myproj-hotfix
# fix the bug
git add -A
git commit -m "fix: handle null payment token"
git push -u origin hotfix/payment

# Open the PR, then clean up
cd -
git worktree remove ../myproj-hotfix
```

### 2. Build/test one branch while coding another

```bash
# Long CI-like test run shouldn't block your editing.
git worktree add ../myproj-ci release/2.0
cd ../myproj-ci && npm ci && npm test    # runs here

# Meanwhile, back in the main worktree, keep developing normally.
```

### 3. Review a colleague's PR locally

```bash
git fetch origin
git worktree add ../myproj-pr origin/feature/their-work
cd ../myproj-pr
# run it, read it, leave comments
cd -
git worktree remove ../myproj-pr
```

### 4. Recover after deleting a worktree folder by hand

```bash
rm -rf ../myproj-old        # oops, removed the dir directly
git worktree list           # still shows ../myproj-old (stale)
git worktree prune          # unregisters the missing worktree
git worktree list           # now clean
```

## Gotchas / tips

- **One branch, one worktree.** Git refuses to check out a branch that is already
  active in another worktree. Use `-b` to branch off, or `--detach` for a throwaway
  inspection.
- **Put worktrees outside the main repo** (e.g. siblings like `../myproj-hotfix`) so
  build tools, globs, and your editor don't recurse into them.
- **`prune` won't reclaim a directory you still have** — it only removes records for
  paths that no longer exist. Use `git worktree remove` to delete a live one.
- **Submodules** need re-init in each worktree:
  `git submodule update --init --recursive`.
- **Shared stash and config:** the stash and `.git/config` are shared across all
  worktrees, but the index, `HEAD`, and untracked files are per-worktree.
- **Locked worktrees survive prune.** Lock trees on removable/network drives so an
  accidental `prune` doesn't unregister them while unmounted.
