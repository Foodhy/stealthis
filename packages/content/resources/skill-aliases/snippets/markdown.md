# Shell Aliases & Functions That Save Time

Aliases and functions turn the long commands you type all day into a few
characters. An **alias** is a simple text substitution; a **function** can take
arguments and run logic. Everything below works in both `bash` and `zsh` unless
noted, uses only shell builtins and standard tools, and is meant to be pasted
straight into your shell config.

## Where to put them

Aliases and functions only persist if they live in a file your shell sources at
startup.

```bash
# bash: interactive non-login shells read ~/.bashrc
#       login shells read ~/.bash_profile (often sources ~/.bashrc)
~/.bashrc
~/.bash_profile

# zsh: interactive shells read ~/.zshrc
~/.zshrc
```

A common pattern is to keep aliases in their own file and source it, so your main
config stays tidy:

```bash
# in ~/.bashrc or ~/.zshrc
[ -f ~/.aliases ] && source ~/.aliases
```

After editing, reload the current shell instead of opening a new terminal:

```bash
source ~/.bashrc    # or: source ~/.zshrc
```

## Alias syntax

The form is `alias name='command'`. No spaces around the `=`. Quote the value if it
contains spaces or special characters.

```bash
alias ll='ls -lah'

# Run alias with no args to list all defined aliases
alias

# Show what a single alias expands to
alias ll

# Remove an alias for the current session
unalias ll
```

To run the real command and bypass an alias of the same name, prefix it with a
backslash:

```bash
\ls          # ignores any `ls` alias
command ls   # same effect, more explicit
```

## Navigation aliases

```bash
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias -- -='cd -'        # `-` jumps to the previous directory
```

## ls aliases

```bash
alias ll='ls -lah'       # long, human-readable sizes, include dotfiles
alias la='ls -A'         # all except . and ..
alias l='ls -CF'         # columns, classify (/ * @ markers)

# On macOS/BSD use -G for color; on GNU/Linux use --color=auto
alias ls='ls --color=auto'   # GNU coreutils
# alias ls='ls -G'           # macOS / BSD
```

## git aliases

```bash
alias g='git'
alias gs='git status'
alias gst='git status -sb'         # short + branch info
alias ga='git add'
alias gaa='git add --all'
alias gc='git commit -m'
alias gca='git commit --amend'
alias gco='git checkout'
alias gcb='git checkout -b'        # create and switch to a branch
alias gb='git branch'
alias gp='git push'
alias gpl='git pull'
alias gf='git fetch --all --prune'
alias gd='git diff'
alias gds='git diff --staged'
alias gl="git log --oneline --graph --decorate -20"
alias gll="git log --oneline --graph --decorate --all"
```

You can also define aliases inside git itself (works regardless of shell):

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --decorate"
# then: git st, git co, git lg
```

## Functions vs aliases

Use an **alias** for a fixed substitution. Use a **function** when you need
arguments placed somewhere other than the end, conditional logic, multiple
commands, or a return value.

```bash
# Alias: arguments are simply appended to the end
alias gc='git commit -m'
gc "fix bug"            # -> git commit -m "fix bug"   (works)

# This does NOT work as an alias — you can't put args in the middle:
# alias mkcd='mkdir $1 && cd $1'   # $1 is NOT expanded in aliases

# Function: full control over arguments
mkcd() {
  mkdir -p "$1" && cd "$1"
}
```

Function syntax is portable across bash and zsh:

```bash
# Preferred POSIX-compatible form
name() {
  commands
}

# bash/zsh also accept the `function` keyword
function name {
  commands
}
```

## Parameterized functions

Arguments are `$1`, `$2`, …; `$@` is all of them, `$#` is the count. Always quote
expansions (`"$1"`, `"$@"`) so paths with spaces survive.

```bash
# Make a directory (and parents) then cd into it
mkcd() {
  mkdir -p "$1" && cd "$1"
}

# Go up N directories: up 3  ->  cd ../../..
up() {
  local count="${1:-1}" path=""
  for ((i = 0; i < count; i++)); do path="../$path"; done
  cd "$path" || return
}

# Create a commit covering all changes in one step
gac() {
  git add --all && git commit -m "$*"
}

# Extract almost any archive by extension
extract() {
  if [ -z "$1" ]; then echo "usage: extract <archive>"; return 1; fi
  case "$1" in
    *.tar.gz|*.tgz) tar xzf "$1" ;;
    *.tar.bz2)      tar xjf "$1" ;;
    *.tar)          tar xf  "$1" ;;
    *.zip)          unzip "$1" ;;
    *.gz)           gunzip "$1" ;;
    *)              echo "extract: don't know how to handle '$1'"; return 1 ;;
  esac
}

# Find files by name fragment under the current dir
ff() {
  find . -type f -iname "*$1*"
}
```

`${1:-1}` supplies a default of `1` when no argument is given. Use `$*` when you
want all the words joined into one string (good for commit messages), and `"$@"`
when you want each argument preserved as a separate word (good for forwarding to
another command).

## Common workflows

### 1. Stage everything and commit in one shot

```bash
# with the gac() function above
gac "wip: refactor auth flow"
# -> git add --all && git commit -m "wip: refactor auth flow"
```

### 2. Make a project folder and drop into it

```bash
mkcd ~/projects/new-app
# now you're inside ~/projects/new-app, already created
```

### 3. Quick branch + push of a feature

```bash
gcb feature/login     # git checkout -b feature/login
# ...edit files...
gaa && gc "add login form"   # git add --all ; git commit -m "..."
gp -u origin feature/login   # gp expands to git push
```

### 4. Inspect history then diff staged changes

```bash
gl          # last 20 commits as a graph
gds         # review what's staged before committing
```

## Gotchas / tips

```bash
# Aliases do NOT expand $1/$2 — use a function when you need arguments mid-command.
# Aliases are not available in non-interactive scripts by default (bash). Prefer
#   functions or full commands inside scripts.

# Quote everything in functions to survive spaces in paths:
mkcd() { mkdir -p "$1" && cd "$1"; }   # good
# mkcd() { mkdir -p $1 && cd $1; }     # breaks on "My Folder"

# Check whether a name is an alias, function, or binary before overriding it:
type ll          # zsh and bash
command -v git    # prints the resolved path/definition

# Overriding a builtin? You can still reach the original:
\ls               # bypass the ls alias once
command cd ...    # bypass a cd function

# zsh tip: enable expansion of aliases inside other aliases is automatic;
# bash expands the first word of each simple command only.

# Reload after editing so changes take effect in the current shell:
source ~/.zshrc   # or ~/.bashrc
```
