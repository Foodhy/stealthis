# Vim Basics Cheatsheet

Vim is a *modal* editor: the same keys do different things depending on the mode
you are in. This cheatsheet covers the essentials — modes, navigation, editing,
search, command-line commands, undo/redo, and the operator-plus-motion grammar
that lets you compose powerful edits from a small vocabulary.

## Modes

Vim starts in **Normal** mode, where keys are commands (not text). You switch
modes to type, select, or run commands.

```text
Normal     command mode (default) — press Esc to return here from any mode
Insert     type text — entered with i, a, o, etc.
Visual     select text — entered with v, V, Ctrl-v
Command     : line commands (save, quit, substitute, etc.)
```

Entering Insert mode:

```vim
i    " insert before the cursor
a    " append after the cursor
I    " insert at first non-blank of line
A    " append at end of line
o    " open a new line below and insert
O    " open a new line above and insert
```

Leaving any mode back to Normal:

```vim
<Esc>     " return to Normal mode (Ctrl-[ also works)
```

## Navigation (hjkl)

The home-row movement keys. No arrow keys needed.

```vim
h    " left
j    " down
k    " up
l    " right
```

Line and screen movement:

```vim
0    " start of line (column 0)
^    " first non-blank character of line
$    " end of line
gg   " first line of file
G    " last line of file
5G   " go to line 5 (also :5)
Ctrl-d  " half page down
Ctrl-u  " half page up
```

## Word motions (w / b / e)

```vim
w    " forward to start of next word
b    " back to start of previous word
e    " forward to end of word
W    " next WORD (whitespace-delimited, ignores punctuation)
B    " previous WORD
E    " end of WORD
```

Counts repeat a motion:

```vim
3w   " move forward 3 words
2b   " move back 2 words
```

## Delete, yank, paste (dd / yy / p)

```vim
dd   " delete (cut) the current line
yy   " yank (copy) the current line
p    " paste after the cursor / below the line
P    " paste before the cursor / above the line
x    " delete the character under the cursor
D    " delete from cursor to end of line
C    " change from cursor to end of line (delete + insert)
```

Counts work here too:

```vim
3dd  " delete 3 lines
2yy  " yank 2 lines
```

## Operators + motions grammar

This is the core idea of Vim. You combine an **operator** with a **motion** (or a
**text object**) and an optional **count**:

```text
[count] operator motion
```

Operators:

```vim
d    " delete
c    " change (delete then enter Insert mode)
y    " yank (copy)
>    " indent
<    " un-indent
```

Combine an operator with a motion:

```vim
dw   " delete to start of next word
de   " delete to end of word
d$   " delete to end of line
dG   " delete to end of file
cw   " change word
c$   " change to end of line
y$   " yank to end of line
2dd  " delete 2 lines
d2w  " delete 2 words
```

Text objects (operator + i/a + object) — extremely useful:

```vim
diw  " delete inner word
daw  " delete a word (includes surrounding space)
ci"  " change inside double quotes
di(  " delete inside parentheses
ci{  " change inside braces
dit  " delete inside an HTML/XML tag
yi[  " yank inside square brackets
```

Doubling the operator acts on the whole line:

```vim
dd   " delete line
cc   " change whole line
yy   " yank line
>>   " indent line
```

## Search (/)

```vim
/word     " search forward for "word", press Enter
?word     " search backward for "word"
n         " repeat search in same direction
N         " repeat search in opposite direction
*         " search forward for word under cursor
#         " search backward for word under cursor
```

While searching, the `set` options below help:

```vim
:set ignorecase    " case-insensitive search
:set incsearch     " show matches as you type
:set hlsearch      " highlight all matches
:noh               " clear search highlight
```

## Command-line (:) commands

Run from Normal mode by pressing `:`.

```vim
:w           " write (save) the file
:q           " quit
:wq          " save and quit (:x is equivalent)
:q!          " quit without saving
:wa          " write all open buffers
:e file.txt  " open file.txt
:42          " jump to line 42
```

Substitution (find & replace):

```vim
:s/old/new/        " replace first match on current line
:s/old/new/g       " replace all matches on current line
:%s/old/new/g      " replace all matches in the whole file
:%s/old/new/gc     " ...with confirmation for each
:10,20s/old/new/g  " replace on lines 10 through 20
```

## Undo / redo

```vim
u        " undo last change
Ctrl-r   " redo
U        " undo all changes on the current line
.        " repeat the last change (the "dot" command)
```

## Common workflows

**1. Rename a variable inside a function call**

```vim
" cursor anywhere inside the parentheses
ci(          " delete inside () and enter Insert mode
newArgs      " type the replacement
<Esc>        " back to Normal
```

**2. Move a line down a few rows**

```vim
dd    " cut the current line
3j    " move down 3 lines
p     " paste below
```

**3. Find a string and replace every occurrence in the file**

```vim
/oldName<Enter>   " jump to the first match to confirm it
:%s/oldName/newName/gc   " replace all, confirming each (y/n/a/q)
```

**4. Duplicate a block and indent it**

```vim
yy    " yank the line (or Vjjy for several lines in Visual mode)
p     " paste a copy below
>>    " indent the new line one level
.     " repeat the indent if needed
```

## Gotchas / tips

```text
- Press Esc whenever you are unsure of your mode; it always returns to Normal.
- Caps Lock left on in Normal mode wreaks havoc (D/C/J differ from d/c/j).
- The dot command (.) repeats your last edit — lean on it instead of retyping.
- d, c, and y do NOT touch the system clipboard by default; they use Vim
  registers. Use "+y / "+p for the system clipboard (needs +clipboard build).
- W/B/E (capitals) treat punctuation as part of the word; w/b/e do not.
- :wq writes even if nothing changed; :x only writes when the buffer changed.
- A count before an operator and before a motion multiply: 2d3w deletes 6 words.
- Run :help <topic> inside Vim for the authoritative docs (e.g. :help motion.txt).
```
