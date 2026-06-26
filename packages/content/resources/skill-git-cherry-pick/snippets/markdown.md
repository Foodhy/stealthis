# Git Cherry-Pick Cheatsheet

`git cherry-pick` applies the changes introduced by one or more existing commits onto
your **current** branch, creating new commits with the same content. Use it to grab a
specific fix or feature without merging or rebasing the entire source branch. Always
check out the target branch first — cherry-pick replays onto wherever `HEAD` is.

## Single commit

```bash
# Apply one commit by hash onto the current branch
git cherry-pick a1b2c3d

# Apply the commit a branch points at
git cherry-pick origin/hotfix
```

## Range of commits

```bash
# Apply a contiguous range (A is EXCLUSIVE, B is inclusive): commits after A up to B
git cherry-pick A..B

# Include the starting commit too (A inclusive through B)
git cherry-pick A^..B

# Multiple individual commits, in the order given
git cherry-pick a1b2c3d 4e5f6a7 8b9c0d1
```

## Record provenance with -x

```bash
# Append a "(cherry picked from commit <hash>)" line to the message
git cherry-pick -x a1b2c3d
```

Use `-x` when cherry-picking between public/shared branches so reviewers can trace
where the change originated. Avoid it for private/local-only source branches, since the
referenced hash may not exist anywhere others can see.

## Stage without committing (--no-commit)

```bash
# Apply changes to the working tree + index but do NOT create a commit
git cherry-pick --no-commit a1b2c3d
# alias: -n

# Stack several commits into one set of staged changes, then commit yourself
git cherry-pick -n a1b2c3d 4e5f6a7
git commit -m "Backport fixes from feature branch"
```

## Resolving conflicts

When a cherry-pick hits a conflict, Git pauses and marks the conflicted files.

```bash
# See what is conflicted
git status

# Edit files to resolve, then stage them
git add path/to/resolved-file

# Continue the cherry-pick (opens editor for the message)
git cherry-pick --continue

# Abort and restore the branch to its pre-cherry-pick state
git cherry-pick --abort

# Skip the current commit and move on (useful in a range)
git cherry-pick --skip

# Reset state but keep the current sequence index (less common)
git cherry-pick --quit
```

Useful extras while resolving:

```bash
# Keep going through a range even if one commit ends up empty after resolution
git cherry-pick --continue   # run after `git add` of resolved files

# Reference the source commit's author/date is preserved by default;
# add your own authorship note to the message during --continue if needed
```

## Handy flags

```bash
# Add a Signed-off-by line
git cherry-pick -s a1b2c3d

# Cherry-pick a merge commit, choosing parent 1 as the mainline
git cherry-pick -m 1 <merge-hash>

# Allow a commit that becomes empty (no changes after applying) to be recorded
git cherry-pick --allow-empty a1b2c3d

# Edit the commit message before committing
git cherry-pick -e a1b2c3d
```

## Common workflows

### 1. Backport a single hotfix to a release branch

```bash
git checkout release/1.4
git cherry-pick -x 9f3a2b1
git push origin release/1.4
```

### 2. Pull a range of commits from a feature branch

```bash
git checkout main
# Everything after the base commit, up to the tip of feature
git cherry-pick base_hash..feature
# Resolve any conflicts as they appear:
#   git add <files> && git cherry-pick --continue
```

### 3. Combine several commits into one

```bash
git checkout main
git cherry-pick -n c1 c2 c3
git commit -m "Squashed backport: c1 + c2 + c3"
```

### 4. Recover from a bad cherry-pick mid-sequence

```bash
git cherry-pick a1b2c3d 4e5f6a7 8b9c0d1
# Conflict on the second commit, decide to drop it:
git cherry-pick --skip
# ...or bail out entirely and undo everything applied so far:
git cherry-pick --abort
```

## Gotchas / tips

- **It creates new commits** with **new hashes** — the original commits are untouched.
  Cherry-picking the same change onto a branch that later merges the source can cause
  duplicate-but-equivalent commits.
- **Range syntax is exclusive on the left.** `A..B` does **not** include `A`. Use
  `A^..B` when you want `A` too.
- **Order matters** for multiple hashes — Git applies them left to right.
- **Check out the target branch first.** Cherry-pick always replays onto `HEAD`.
- **`-x` only makes sense for shared source commits**; the referenced hash must be
  findable by others.
- **In-progress state:** if you forget where you are, `git status` tells you a
  cherry-pick is underway and lists conflicted paths. Use `--abort` to fully reset.
- **Empty results:** if a commit's changes already exist on the target, Git stops with
  an "empty" message — resolve with `--skip`, or `--allow-empty` to record it anyway.
- Prefer `merge`/`rebase` when you actually want the whole branch; cherry-pick is for
  surgical, one-off transplants.
