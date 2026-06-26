# Vim Advanced — Macros & Registers Cheatsheet

The high-leverage parts of Vim for repetitive and structural editing. Record a
sequence once with a macro, stash text in named registers, jump around with
marks, batch-apply commands with `:g`, edit columns with visual-block, select
precisely with text objects, and rewrite with substitution backreferences.

## Macros (q)

Record a sequence of keystrokes into a register, then replay it.

```vim
qa        " start recording into register a
...       " any normal-mode edits
q         " stop recording
@a        " replay macro a
@@        " replay the last-run macro
5@a       " replay macro a five times
```

Append more keystrokes to an existing macro by recording into the **uppercase**
name:

```vim
qA        " append to register a (don't overwrite)
q         " stop
```

Run a macro on every matching line, or over a visual selection:

```vim
:g/pattern/normal @a        " run macro a on every line matching pattern
:'<,'>normal @a             " run macro a on each line of a visual selection
```

A macro is just text in a register — view or edit it:

```vim
:registers a    " show contents of register a
"ap             " paste register a so you can edit the keystrokes
"add            " yank the edited line back into register a
```

## Named registers

Registers hold yanked/deleted text. Prefix any yank/delete/paste with `"x`.

```vim
"ayy      " yank current line into register a
"ap       " paste from register a
"Ayy      " APPEND current line to register a (uppercase = append)
"byiw     " yank inner word into register b
```

Special registers:

```vim
""        " unnamed (default) register
"0        " last yank (survives later deletes)
"1 - "9   " delete/change ring (most recent in 1)
"+        " system clipboard
"*        " primary selection (X11)
"%        " current file name (read-only)
".        " last inserted text (read-only)
"/        " last search pattern
"_        " black hole — delete without clobbering a register
```

Use the black hole to delete without losing your yank:

```vim
yiw       " yank a word
viw"_p    " select another word and paste over it WITHOUT overwriting register 0
```

Insert a register's contents while in insert mode with `Ctrl-r`:

```vim
i<C-r>a   " insert register a
i<C-r>0   " insert last yank
i<C-r>%   " insert current file name
```

## Marks

Drop a position you can jump back to. Backtick jumps to exact column; single
quote jumps to the line's first non-blank.

```vim
ma        " set mark a at cursor
`a        " jump to exact position of mark a
'a        " jump to start of line of mark a
:marks    " list all marks
:delmarks a     " delete mark a
:delmarks!      " delete all lowercase marks for the buffer
```

Automatic marks:

```vim
``        " jump back to position before last jump
`.        " last change
`^        " last insert
`[  `]    " start / end of last yank or change
`<  `>    " start / end of last visual selection
```

Use a mark as a range boundary in ex commands:

```vim
:'a,'bd   " delete from mark a to mark b
```

## Ex commands :g (global)

Run a command on every line matching (or not matching) a pattern.

```vim
:g/pattern/d              " delete all lines matching pattern
:g!/pattern/d             " delete all lines NOT matching (also :v/pattern/d)
:v/pattern/d              " same as :g! — keep only matching lines
:g/TODO/normal A  <-- fix " append text on every TODO line
:g/^$/d                   " delete all blank lines
:g/pattern/s//REPLACE/g   " substitute on matching lines (empty // reuses pattern)
:g/pattern/m$             " move all matching lines to end of file
:g/pattern/m0             " move all matching lines to top of file
:g/pattern/t.             " duplicate (copy) each matching line below itself
```

Sort and dedupe a block:

```vim
:'<,'>sort         " sort selection
:'<,'>sort u       " sort and remove duplicate lines
:'<,'>sort n       " numeric sort
:%!sort | uniq     " filter whole file through external sort+uniq
```

## Visual-block (Ctrl-v)

Select a rectangular column region for column-wise edits.

```vim
<C-v>     " enter visual-block mode
" select rows with j/k and columns with l/h, then:
I text<Esc>   " INSERT text at start of every selected row
A text<Esc>   " APPEND text after the block on every row
c text<Esc>   " change the block on every row
d             " delete the column block
x             " delete selected characters
r-            " replace every char in block with -
```

Useful column tricks:

```vim
<C-v>$A;<Esc>   " select to end of each line, append ; to all rows
g<C-v>          " reselect the last visual-block region
```

> Note: `I` and `A` only propagate to all rows when you leave insert mode with
> `<Esc>` (not arrow keys).

## Text objects

Operate on structural units. Combine with operators (`d`, `c`, `y`, `v`, `=`).
`i` = inner (contents), `a` = a (contents + delimiters/whitespace).

```vim
diw / daw   " delete inner word / a word (with surrounding space)
ciw         " change inner word
ci"  ci'    " change inside quotes
ci(  cib    " change inside ( )       (b = block/paren)
ci{  ciB    " change inside { }       (B = Big block/brace)
ci[  ci<    " change inside [ ] or < >
cit         " change inside an XML/HTML tag
dit / dat   " delete inside tag / the whole tag
dip / dap   " delete inner paragraph / a paragraph
das         " delete a sentence
yi(  ya(    " yank inside / around parens
```

Counts work too:

```vim
d2aw        " delete two words
ci2(        " change inside the second-level parens out
```

## :s with backreferences

Substitute with capture groups. Use `\(...\)` to capture (magic mode) and `\1`,
`\2`, … to reference them in the replacement.

```vim
:%s/\(\w\+\)=\(\w\+\)/\2=\1/      " swap key=value -> value=key on every line
:%s/\(.*\)/"\1"/                  " wrap every line in double quotes
:%s/foo\(bar\)/baz\1/g            " keep the captured 'bar', change foo->baz
```

Use `\v` (very magic) so you don't have to escape `(` `)` `+`:

```vim
:%s/\v(\w+)\s+(\w+)/\2 \1/        " swap two whitespace-separated words
:%s/\v(\d{4})-(\d{2})-(\d{2})/\3\/\2\/\1/   " 2026-06-22 -> 22/06/2026
```

Case-changing escapes in the replacement:

```vim
\u  " uppercase next char        \l  " lowercase next char
\U  " uppercase until \E         \L  " lowercase until \E
:%s/\v<(\w)/\u\1/g               " capitalize the first letter of every word
:%s/\v(\w+)/\U\1/                " uppercase the first word of each line
```

Common flags: `g` (all on line), `i` (ignore case), `c` (confirm each), `n`
(count matches only, no change):

```vim
:%s/old/new/gc      " replace all, confirm each
:%s/old//gn         " count occurrences of 'old' without changing anything
```

Submatch helpers: `&` = whole match, `~` = previous replacement string.

```vim
:%s/\d\+/(&)/g      " wrap every number in parentheses
```

## Common workflows

### 1. Turn a plain list into a quoted, comma-separated array

```vim
" Start on the first item. Record:
qa            " start macro
I"<Esc>       " add opening quote
A",<Esc>      " add closing quote + comma
j             " move to next line
q             " stop
9@a           " apply to the next 9 lines
```

Or do it in one substitution:

```vim
:%s/\v(.+)/"\1",/
```

### 2. Renumber an ordered list with a macro

```vim
" Lines start with '1. '. Place cursor on the number.
qa            " record
^            " go to line start
<C-a>         " increment number under cursor
j             " next line
q             " stop
" Set each line to the previous number first, then:
:2,$normal @a    " increment lines 2..end relative to neighbours
```

### 3. Comment out only the lines matching a pattern

```vim
:g/console\.log/normal I// 
" runs 'I// ' (insert '// ' at line start) on every console.log line
```

### 4. Reformat date columns across a CSV block

```vim
" Visually select the block, then rewrite YYYY-MM-DD to DD/MM/YYYY:
:'<,'>s/\v(\d{4})-(\d{2})-(\d{2})/\3\/\2\/\1/
```

## Gotchas / tips

- **Macros stop on error.** If a motion fails mid-macro (e.g. search not found),
  the macro aborts — count repeats stop there. Use `:g` for "do X on every match"
  so missing matches simply skip.
- **Uppercase register = append**, lowercase = overwrite. True for both yanks
  (`"Ayy`) and macro recording (`qA`).
- **`"0` survives deletes.** After yanking, any `d`/`x` shifts the unnamed
  register; `"0p` still pastes your last *yank*.
- **`'` vs `` ` `` for marks/ranges.** `` `a `` is exact (line + column); `'a`
  is the line. Use `` `a `` when the column matters.
- **`\v` (very magic)** removes most backslashes in patterns — `(`, `)`, `+`,
  `{`, `?` work literally. Great for substitutions with groups.
- **Empty pattern reuses the last one.** `:s//new/` and `:g/x/s//y/` reuse the
  prior search/pattern from register `/`.
- **`:v` is `:g!`** — keep only matching lines with `:v/keep/d`.
- **Black hole `"_`** prevents pasting over a register: `viw"_p` replaces a word
  without losing your yanked text.
- **Repeat a visual selection** with `gv`; re-run the last `:s` on a range with
  `&` (or `:&&` to keep flags).
