# Git Stash Cheatsheet

`git stash` shelves your uncommitted changes (tracked, modified, and staged) and resets
your working tree to a clean `HEAD`, so you can switch contexts and restore the work
later. Stashes are stored in a LIFO stack (`stash@{0}` is the most recent). This sheet
covers naming, listing, restoring, untracked files, single-file stashes, and stash
branches.

## Create a stash

```bash
# Stash all tracked, modified + staged changes
git stash

# Same thing, modern explicit form
git stash push

# Stash with a descriptive message (recommended)
git stash push -m "wip: refactor auth middleware"
```

A named stash is far easier to find later in `git stash list`.

## List & inspect stashes

```bash
# List all stashes
git stash list
# stash@{0}: On main: wip: refactor auth middleware
# stash@{1}: WIP on feature: 1a2b3c4 add header

# Show a summary of files changed in the latest stash
git stash show

# Show the full diff of a specific stash
git stash show -p stash@{1}
```

## pop vs apply

Both restore stashed changes onto your working tree. The difference is what happens to
the stash entry afterward.

```bash
# Apply the latest stash AND remove it from the stack
git stash pop

# Apply the latest stash but KEEP it in the stack
git stash apply

# Target a specific stash by reference
git stash pop stash@{2}
git stash apply stash@{2}
```

- Use `pop` for the normal "resume my work" case.
- Use `apply` when you want to apply the same stash to multiple branches, or keep a safe
  copy until you're sure it applied cleanly.

If a `pop` hits merge conflicts, the stash is **not** dropped — resolve the conflicts,
then remove it manually with `git stash drop`.

## Include untracked files (-u)

Plain `git stash` ignores untracked and ignored files. Use `-u` (`--include-untracked`)
to also stash brand-new files.

```bash
# Stash tracked changes + untracked (new) files
git stash -u
git stash push -u -m "wip: new config module"

# Also include ignored files (rarely needed)
git stash -a   # --all
```

## Stash a single file (or a few)

Pass pathspecs to `git stash push` to stash only specific files; everything else stays in
your working tree.

```bash
# Stash just one file
git stash push -m "wip: only the form" src/components/Form.tsx

# Stash several specific paths
git stash push src/api.ts tests/api.test.ts

# Interactively choose hunks to stash
git stash push -p
```

## Stash into a new branch

`git stash branch` creates a new branch starting from the commit the stash was made on,
checks it out, then applies the stash and drops it. Great when stashed changes conflict
with the current `HEAD`, or when the work really belongs on its own branch.

```bash
# Create branch 'fix/auth' from the stash's base and apply stash@{0}
git stash branch fix/auth

# Use a specific stash
git stash branch fix/auth stash@{1}
```

## Clean up stashes

```bash
# Remove a specific stash
git stash drop stash@{0}

# Remove ALL stashes (irreversible)
git stash clear
```

## Common workflows

### 1. Quick context switch for a hotfix

```bash
git stash push -m "wip: dashboard charts"   # shelve current work
git switch main
git switch -c hotfix/login-bug              # do the fix...
git switch feature/dashboard
git stash pop                               # resume where you left off
```

### 2. Unblock a `git pull`

```bash
git pull
# error: local changes would be overwritten by merge
git stash
git pull
git stash pop                               # reapply your edits on top
```

### 3. Move accidental work to the right branch

```bash
# Oops — edited files while on main
git stash -u
git stash branch feature/new-widget         # branch + apply in one step
```

### 4. Share a stash across two branches

```bash
git stash push -m "shared tweak"
git switch branch-a && git stash apply       # keep stash
git switch branch-b && git stash apply
git stash drop                               # remove once both are done
```

## Gotchas / tips

- **Stashes are local.** They never get pushed and aren't part of any commit or branch.
- **Untracked files need `-u`.** Plain `git stash` leaves new files behind — easy to lose
  track of.
- **`pop` keeps the stash on conflict.** It only auto-drops on a clean apply; otherwise
  resolve, then `git stash drop`.
- **Always name your stashes** with `-m`. A stack of unlabeled `WIP on ...` entries is
  painful to navigate.
- **`stash@{0}` is the newest.** References shift as you push/drop, so re-check `git stash
  list` before targeting a specific entry.
- **Recover a dropped stash** (within gc window) via `git fsck --no-reflog | grep commit`
  to find the dangling commit, then `git stash apply <sha>`.
- **Stashing doesn't touch ignored files** unless you pass `-a` / `--all`.
