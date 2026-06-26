# fzf — Fuzzy Finder with ripgrep Cheatsheet

`fzf` is an interactive fuzzy finder: it takes a list on stdin, filters it as you
type, and prints what you pick on stdout. Combined with `ripgrep` (`rg`) for fast
file and content listing, it turns the terminal into a rapid navigation tool. This
cheatsheet covers the basics, default key bindings, piping `rg` into fzf, the
preview window, and writing your own fzf-backed shell functions.

## Install

```bash
# macOS
brew install fzf ripgrep

# Debian / Ubuntu
sudo apt install fzf ripgrep

# Enable key bindings + completion (Homebrew install path)
$(brew --prefix)/opt/fzf/install
```

After installing, source the shell integration so `Ctrl-R`/`Ctrl-T`/`Alt-C` work:

```bash
# bash
eval "$(fzf --bash)"

# zsh
source <(fzf --zsh)
```

## Basics

```bash
# Pick a file from the current tree, print the choice
find . -type f | fzf

# Open the selection in your editor
vim "$(fzf)"

# Read selection from a pipe
cat /etc/hosts | fzf
```

Search syntax inside the fzf prompt (extended-search mode, on by default):

```text
sbtrkt     fuzzy match (any char order)
'wild      exact match (items containing "wild")
^music     prefix match (starts with "music")
.mp3$      suffix match (ends with ".mp3")
!fire      inverse match (items NOT containing "fire")
foo bar    AND: both terms must match
foo | bar  OR: either term matches
```

Useful flags:

```bash
fzf -m                 # multi-select (TAB / Shift-TAB to toggle)
fzf -i                 # case-insensitive
fzf +i                 # case-sensitive
fzf -q 'init'          # start with an initial query
fzf --height 40%       # render inline instead of full screen
fzf --reverse          # prompt at the top, list below
fzf --print-query      # also print the typed query, not just the match
```

## Key bindings (shell integration)

Once the shell integration is sourced, these defaults are available at any prompt:

```text
CTRL-R   Fuzzy-search command history; Enter pastes it to the prompt
CTRL-T   Fuzzy-pick file/dir paths; inserts them at the cursor
ALT-C    Fuzzy-pick a directory and cd into it
```

Bindings inside the fzf window itself:

```text
CTRL-J / CTRL-N / Down   move down
CTRL-K / CTRL-P / Up     move up
TAB / SHIFT-TAB          toggle selection (with -m / multi)
ENTER                    accept selection
ESC / CTRL-C / CTRL-G    cancel
CTRL-/                   toggle preview window
SHIFT-Up / SHIFT-Down    scroll preview
```

Customize what `Ctrl-T` and `Alt-C` list by exporting commands (here using `rg`/`fd`):

```bash
# Use ripgrep to feed CTRL-T (files only, includes hidden, skips .git)
export FZF_CTRL_T_COMMAND='rg --files --hidden --glob "!.git/*"'

# Default command used when fzf is run with no input piped in
export FZF_DEFAULT_COMMAND='rg --files --hidden --glob "!.git/*"'

# Sensible global look & feel
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
```

## Piping ripgrep into fzf

List files with `rg`, then fuzzy-pick one to open:

```bash
rg --files | fzf | xargs -r -o nvim
```

Live content search — re-run `rg` on every keystroke using `--bind change:reload`.
fzf here is just the picker; `rg` does the matching:

```bash
rg --line-number --no-heading --color=always --smart-case '' \
  | fzf --ansi
```

A fully interactive grep where typing reloads `rg`:

```bash
INITIAL=""
rg --line-number --no-heading --color=always --smart-case "$INITIAL" \
  | fzf --ansi \
        --disabled --query "$INITIAL" \
        --bind "change:reload:rg --line-number --no-heading --color=always --smart-case {q} || true" \
        --delimiter : \
        --preview 'bat --color=always {1} --highlight-line {2}' \
        --preview-window 'up,60%,border-bottom,+{2}+3/3'
```

Notes on placeholders:

```text
{}    the whole selected line
{q}   the current query string typed in fzf
{1}   first field after splitting on --delimiter (here: the file path)
{2}   second field (here: the line number)
```

## Preview window

The `--preview` option runs a command for the highlighted item and shows its output:

```bash
# Preview file contents with bat (falls back to cat if bat is absent)
rg --files | fzf --preview 'bat --color=always {} || cat {}'

# Preview window placement and size
fzf --preview 'cat {}' --preview-window 'right,60%'
fzf --preview 'cat {}' --preview-window 'up,50%,border-horizontal'
fzf --preview 'cat {}' --preview-window 'hidden'   # toggle with CTRL-/
```

Jump the preview to a specific line (e.g. for grep results, `{2}` is the line number):

```bash
fzf --delimiter : \
    --preview 'bat --color=always {1} --highlight-line {2}' \
    --preview-window '+{2}-/2'   # center the matched line in the preview
```

## fzf in shell functions

Wrap common picks in functions you can call by name.

Fuzzy-find a file and open it in your editor:

```bash
fe() {
  local file
  file=$(rg --files --hidden --glob '!.git/*' \
          | fzf --query "$1" --select-1 --exit-0 \
                --preview 'bat --color=always {} || cat {}')
  [ -n "$file" ] && "${EDITOR:-vim}" "$file"
}
```

Fuzzy-search code, open the result at the matched line:

```bash
rgo() {
  local result file line
  result=$(rg --line-number --no-heading --color=always --smart-case "$1" \
            | fzf --ansi --delimiter : \
                  --preview 'bat --color=always {1} --highlight-line {2}') || return
  file=$(printf '%s' "$result" | cut -d: -f1)
  line=$(printf '%s' "$result" | cut -d: -f2)
  [ -n "$file" ] && "${EDITOR:-vim}" +"$line" "$file"
}
```

Fuzzy-cd into any subdirectory (uses `fd` for speed; swap for `find` if needed):

```bash
fcd() {
  local dir
  dir=$(fd --type d --hidden --exclude .git | fzf --preview 'ls -la {}') \
    && cd "$dir" || return
}
```

Fuzzy-checkout a git branch:

```bash
fco() {
  local branch
  branch=$(git branch --all --color=never \
            | sed 's/^[* ]*//; s#remotes/[^/]*/##' \
            | sort -u \
            | fzf --query "$1") \
    && git checkout "$branch"
}
```

## Common workflows

Open a file by content match, jump straight to the line:

```bash
rg --line-number --no-heading --smart-case 'TODO' \
  | fzf --delimiter : --preview 'bat --color=always {1} --highlight-line {2}' \
  | awk -F: '{print "+"$2, $1}' \
  | xargs -r vim
```

Kill a process interactively:

```bash
ps -ef | sed 1d | fzf -m | awk '{print $2}' | xargs -r kill -9
```

Stage selected files in git, with a diff preview:

```bash
git -c color.status=always status --short \
  | fzf -m --ansi --preview 'git diff --color=always {2}' \
  | awk '{print $2}' \
  | xargs -r git add
```

Search history and run the chosen command immediately:

```bash
# Outside Ctrl-R, you can do this manually:
eval "$(history | fzf --tac --no-sort | sed 's/^[ ]*[0-9]*[ ]*//')"
```

## Gotchas / tips

- **`--ansi` is required** when your input contains color codes (e.g. `rg --color=always`),
  otherwise fzf shows raw escape sequences.
- **Use `--disabled` for reload-driven search** so fzf does not fuzzy-filter the lines a
  second time — `rg` already did the matching via `{q}`.
- **Quote `{}` placeholders** in previews and binds so paths with spaces survive:
  `--preview 'bat {}'` expands `{}` already shell-quoted by fzf.
- **`--select-1 --exit-0`** auto-accepts when there is exactly one match and exits cleanly
  when there are none — handy inside functions.
- **`FZF_DEFAULT_COMMAND`** only affects fzf run with no piped stdin; explicit pipes
  (`rg --files | fzf`) ignore it.
- **`Ctrl-/`** toggles the preview window at runtime; pair it with `--preview-window hidden`
  to keep previews off by default.
- **Performance:** prefer `rg --files` / `fd` over `find` for large trees — they respect
  `.gitignore` and are dramatically faster.
