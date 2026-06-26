# Git Rebase Cheatsheet — Interactive History Rewriting

Interactive rebase (`git rebase -i`) replays a range of commits one by one, letting you edit a
"todo list" to squash, reword, reorder, edit, or drop each one. This cheatsheet collects the verbs,
the `--onto` and `--autosquash` workflows, and how to recover with the reflog. **Golden rule:** only
rewrite commits you have not shared, or be ready to force-push.

## Start an interactive rebase

```bash
# Edit the last N commits
git rebase -i HEAD~3

# Edit every commit since you branched off main
git rebase -i main

# Edit since a specific commit (the commit itself is the base, NOT included)
git rebase -i <base-commit-sha>

# Rebase the root: include the very first commit too
git rebase -i --root
```

This opens your `$GIT_EDITOR` with a todo list, oldest commit at the **top**, newest at the bottom.

## The todo-list verbs

```text
pick   2f1a0bc add login form        # use the commit as-is
reword 9c3d4ef fix typo              # use commit, but edit its message
edit   a1b2c3d add validation        # stop here to amend the commit (files/content)
squash 5e6f7a8 wip styling          # merge into PREVIOUS commit, combine messages
fixup  8b9c0d1 wip more styling     # merge into PREVIOUS commit, DISCARD this message
drop   d4e5f6a debug print           # remove the commit entirely
exec   make test                     # run a shell command at this point
```

Short forms also work: `p`, `r`, `e`, `s`, `f`, `d`, `x`. To **reorder**, just move the lines.
To **drop**, either use `drop` or delete the line.

Finish/abort an in-progress rebase:

```bash
git rebase --continue   # after resolving conflicts / finishing an `edit` stop
git rebase --skip       # skip the current commit
git rebase --abort      # bail out, return to the original state
```

## Squash vs fixup

```text
pick   aaa add feature
squash bbb tweak feature   # opens editor to write a combined message
```

```text
pick   aaa add feature
fixup  bbb tweak feature   # silently folds bbb into aaa, keeps aaa's message
```

Use `squash` when you want to curate the combined message; use `fixup` when the extra commit is
pure noise.

## Reword a commit message

```text
reword 9c3d4ef fix typo
```

Git replays up to that commit, then opens the editor so you can rewrite its message. To reword only
the most recent commit, you don't need rebase at all:

```bash
git commit --amend
```

## Edit (amend) an older commit

Mark it `edit`; the rebase pauses with that commit checked out:

```bash
git rebase -i HEAD~4          # set the target line to: edit <sha>
# rebase stops on that commit:
#   change files, then:
git add <files>
git commit --amend           # rewrite the commit (use --no-edit to keep its message)
git rebase --continue
```

You can also split one commit into two while stopped on an `edit`:

```bash
git reset HEAD^              # un-commit, keep changes in the working tree
git add part1 && git commit -m "first half"
git add part2 && git commit -m "second half"
git rebase --continue
```

## rebase --onto (transplanting commits)

`--onto` moves a slice of commits onto a new base. Syntax:

```bash
git rebase --onto <new-base> <old-base> <branch>
```

```bash
# You branched feature off the wrong base; move it onto main.
# Replay commits after `wrong-base` onto `main`:
git rebase --onto main wrong-base feature

# Drop the first few commits of a branch: replay everything after
# <keep-from> directly onto main.
git rebase --onto main <keep-from> HEAD

# Move a sub-branch (topic) that sits on top of `feature` onto `main`:
git rebase --onto main feature topic
```

Read it as: take the commits in `(<old-base>, <branch>]` and re-apply them starting from
`<new-base>`.

## Autosquash (automate fixups)

Create "fixup!" or "squash!" commits that target an earlier commit, then let rebase order and fold
them automatically.

```bash
# Make a commit that will fold into <sha> (message is auto-prefixed):
git commit --fixup <sha>
git commit --squash <sha>      # combine message instead of discarding

# Then run rebase with autosquash; the todo list is pre-arranged:
git rebase -i --autosquash <base>
```

Make it the default so you can drop the flag:

```bash
git config --global rebase.autosquash true
```

`--fixup=amend:<sha>` lets you change both the content and the message of the target commit during
autosquash.

## Recovering with the reflog

The reflog records every position `HEAD` (and each branch) has had — even "lost" commits from a
botched rebase are reachable for ~90 days.

```bash
git reflog                       # list recent HEAD positions with shas
git reflog show <branch>         # reflog for a specific branch

# Find the entry from BEFORE the rebase, e.g. "rebase (start)" or your last good commit:
#   abc1234 HEAD@{5}: commit: good state

# Hard-reset the branch back to that point:
git reset --hard HEAD@{5}
# or by sha:
git reset --hard abc1234
```

If you only need one lost commit, cherry-pick it instead of resetting everything:

```bash
git cherry-pick <lost-sha>
```

## Common workflows

### 1. Clean up a messy feature branch before opening a PR

```bash
git rebase -i main
# In the editor: keep the first real commit as `pick`,
# turn the "wip"/"fix" commits into `fixup`, `reword` the headline.
git push --force-with-lease
```

### 2. Quick fix to an older commit using autosquash

```bash
# Find the commit that introduced the bug:
git log --oneline
# Fix the code, then attach the fix to that commit:
git add src/auth.js
git commit --fixup 2f1a0bc
git rebase -i --autosquash main   # rebase folds it in automatically
```

### 3. Move a branch off a stale base onto the latest main

```bash
git fetch origin
git rebase --onto origin/main old-main feature
# resolve any conflicts:
git add . && git rebase --continue
git push --force-with-lease
```

### 4. Undo a rebase that went wrong

```bash
git reflog
# spot the pre-rebase HEAD, e.g. HEAD@{7}
git reset --hard HEAD@{7}
```

## Gotchas / tips

- **Never rebase shared history** unless everyone agrees — rewritten shas force collaborators to
  re-sync. Coordinate, then push with `--force-with-lease` (safer than `--force`: it refuses if the
  remote moved).
- `squash`/`fixup` fold into the commit **above** them in the list; the first line can't be a
  squash/fixup.
- Conflicts pause the rebase. Fix files, `git add` them, then `git rebase --continue` — do **not**
  `git commit`.
- The base commit in `git rebase -i <sha>` is **not** included in the editable range; it's the
  starting point.
- Set `git config --global rerere.enabled true` to have Git remember and reapply your conflict
  resolutions across repeated rebases.
- Use `git rebase -i --exec "npm test" main` to run tests after every replayed commit and catch the
  exact one that breaks.
- Lost commits are not gone immediately — `git reflog` plus `git reset --hard` or `git cherry-pick`
  almost always brings them back.
- Prefer `git pull --rebase` to keep a linear history instead of merge commits when updating a
  branch.
```
