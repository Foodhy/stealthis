# Tmux Cheatsheet

Tmux is a terminal multiplexer: it runs multiple shells inside one terminal as
**sessions** that hold **windows** (tabs) which hold **panes** (splits). Sessions
keep running on the host after you detach, so you can disconnect, reconnect, and
pick up exactly where you left off. Almost every in-tmux keybinding starts with the
**prefix key**, which is `Ctrl-b` by default (often remapped to `Ctrl-a`).

## Mental model

- **Server** — one background process owns all sessions.
- **Session** — a named collection of windows. Survives detach.
- **Window** — a full-screen tab inside a session.
- **Pane** — a split region inside a window, each running its own shell.

## Prefix key

Press the prefix, release it, then press the command key.

```text
Ctrl-b        default prefix
Ctrl-b ?      list all key bindings (q to quit)
Ctrl-b :      open the tmux command prompt
Ctrl-b d      detach from the current session
```

## Sessions (from the shell)

```bash
tmux                       # start a new unnamed session
tmux new -s work           # new session named "work"
tmux ls                    # list sessions
tmux attach -t work        # attach to session "work"
tmux a                     # attach to the most recent session
tmux new -As work          # attach if "work" exists, else create it
tmux kill-session -t work  # kill one session
tmux kill-server           # kill every session
tmux rename-session -t old new
```

### Sessions (inside tmux, via prefix)

```text
Ctrl-b s      interactive session switcher
Ctrl-b $      rename the current session
Ctrl-b (      previous session
Ctrl-b )      next session
Ctrl-b d      detach
```

## Windows

```text
Ctrl-b c      create a new window
Ctrl-b ,      rename the current window
Ctrl-b w      list/choose windows interactively
Ctrl-b n      next window
Ctrl-b p      previous window
Ctrl-b 0..9   jump to window by number
Ctrl-b l      last (previously active) window
Ctrl-b &      kill the current window (asks to confirm)
Ctrl-b .      move window to a new index (prompts for number)
```

## Panes & splits

```text
Ctrl-b %      split vertically (left | right)
Ctrl-b "      split horizontally (top / bottom)
Ctrl-b o      cycle to the next pane
Ctrl-b ;      toggle to the last active pane
Ctrl-b Up/Down/Left/Right   move to the pane in that direction
Ctrl-b q      show pane numbers (press the number to jump)
Ctrl-b z      zoom/unzoom the current pane (toggle full screen)
Ctrl-b {      swap pane with the previous one
Ctrl-b }      swap pane with the next one
Ctrl-b !      break the current pane out into its own window
Ctrl-b x      kill the current pane (asks to confirm)
Ctrl-b space  cycle through preset layouts
```

### Resizing panes

```text
Ctrl-b Ctrl-Up/Down/Left/Right   resize by 1 cell (repeatable while holding)
Ctrl-b Alt-Up/Down/Left/Right    resize by 5 cells
```

Or from the command prompt:

```text
Ctrl-b :resize-pane -D 10     # grow downward by 10 cells
Ctrl-b :resize-pane -R 20     # grow rightward by 20 cells
```

## Detach & attach

Detaching leaves everything running on the host.

```text
Ctrl-b d      detach the current client
```

```bash
tmux attach -t work        # reattach to "work"
tmux attach -d -t work     # attach and detach any other client (avoid size clash)
```

## Copy mode (scrollback, search, copy)

Enter copy mode to scroll, search, and yank text. Default key bindings are
**emacs**-style; the `vi` examples below assume `set -g mode-keys vi`.

```text
Ctrl-b [      enter copy mode
q             quit copy mode
```

In copy mode (vi keys):

```text
Up/Down, k/j      scroll line by line
Ctrl-u / Ctrl-d   half page up / down
g / G             jump to top / bottom
/  then text      search forward
?  then text      search backward
n / N             repeat search forward / backward
Space             start selection
Enter or y        copy selection to the tmux buffer
```

Paste what you copied:

```text
Ctrl-b ]      paste the most recent buffer
Ctrl-b =      choose from the list of buffers to paste
```

## Plugins: TPM, resurrect & continuum

[TPM](https://github.com/tmux-plugins/tpm) manages plugins;
[tmux-resurrect](https://github.com/tmux-plugins/tmux-resurrect) saves and restores
sessions, windows, panes, and layouts across reboots;
[tmux-continuum](https://github.com/tmux-plugins/tmux-continuum) automates the saving.

Install TPM:

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

Add to `.tmux.conf`:

```tmux
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'

# auto-restore the last saved environment on tmux start
set -g @continuum-restore 'on'

# keep this line last
run '~/.tmux/plugins/tpm/tpm'
```

Then reload and install:

```text
Ctrl-b I      install plugins listed in .tmux.conf (capital i)
Ctrl-b U      update plugins
Ctrl-b alt-u  remove plugins no longer listed
```

Resurrect bindings (defaults):

```text
Ctrl-b Ctrl-s     save the tmux environment
Ctrl-b Ctrl-r     restore the saved environment
```

## A sane .tmux.conf

```tmux
# ── Prefix: Ctrl-a is easier to reach than Ctrl-b ──────────────
unbind C-b
set -g prefix C-a
bind C-a send-prefix          # press Ctrl-a twice to send a literal Ctrl-a

# ── General ─────────────────────────────────────────────────────
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",*256col*:Tc"   # truecolor passthrough
set -g history-limit 50000                   # bigger scrollback
set -g mouse on                              # click panes, drag to resize, scroll
set -sg escape-time 10                       # snappier ESC in vim
set -g focus-events on
set -g base-index 1                          # windows start at 1
setw -g pane-base-index 1                    # panes start at 1
set -g renumber-windows on                   # keep window numbers gapless

# ── Reload config without restarting ────────────────────────────
bind r source-file ~/.tmux.conf \; display "Config reloaded"

# ── Intuitive splits that keep the current directory ────────────
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind c new-window -c "#{pane_current_path}"

# ── Vim-style pane navigation ───────────────────────────────────
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# ── Copy mode: vi keys ──────────────────────────────────────────
setw -g mode-keys vi
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send -X copy-selection-and-cancel

# ── Plugins (TPM) ───────────────────────────────────────────────
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-restore 'on'
run '~/.tmux/plugins/tpm/tpm'   # keep last
```

## Common workflows

### 1. Remote work that survives a dropped SSH connection

```bash
ssh me@server
tmux new -As deploy        # attach or create "deploy"
# ...run a long build/migration...
# connection drops or you press Ctrl-b d
ssh me@server
tmux attach -t deploy      # everything is still running
```

### 2. A three-pane dev layout (editor + server + logs)

```bash
tmux new -s app
# inside tmux:
#   Ctrl-b |        split right  -> run the dev server
#   Ctrl-b -        split that pane down -> tail logs
#   Ctrl-b h        jump back to the left pane and start your editor
#   Ctrl-b z        zoom the editor when you need focus, again to unzoom
```

### 3. Reload config after editing it

```bash
$EDITOR ~/.tmux.conf
# inside any tmux session:
#   Ctrl-b r        source the file and show "Config reloaded"
```

### 4. Scroll back and copy an error to paste elsewhere

```text
Ctrl-b [          enter copy mode
?error            search backward for "error", press Enter
v                 start selection (vi keys), move to extend
y                 copy and exit copy mode
Ctrl-b ]          paste it into the current shell
```

## Gotchas / tips

- **`escape-time`**: the default 500ms delay makes Vim feel laggy inside tmux. Set
  `escape-time 10`.
- **Truecolor**: colors look washed out unless `default-terminal` is a 256color
  terminfo *and* you add the `Tc` override; otherwise themes fall back to 256.
- **Size clash**: if two clients attach to one session the smaller window size
  wins and you get an empty border. Use `tmux attach -d` to detach the others.
- **Send a literal prefix**: after remapping to `Ctrl-a`, press it twice to send a
  real `Ctrl-a` to programs like the shell's beginning-of-line.
- **`Ctrl-b I` is uppercase**: lowercase `i` shows window info; capital `I`
  installs TPM plugins.
- **Reload, do not restart**: changes to `.tmux.conf` are not live until you
  `source-file` it (the `Ctrl-b r` binding above) or restart the server.
- **Indexing**: `base-index 1` and `pane-base-index 1` align window/pane numbers
  with the number-row keys you press to jump to them.
- **Kill it all**: `tmux kill-server` ends every session and the background server
  at once — handy when something is wedged.
