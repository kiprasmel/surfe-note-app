# note-app

https://note.kipras.org

## Setup

- tested with node v16

```sh
git clone https://github.com/kiprasmel/surfe-note-app
cd surfe-note-app

yarn
yarn start
```

## Notes for reviewers

Commits are separated pretty well for reviewing individually & seeing thru the
history, thought there's quite a few of them.

The design of the app's system is discussed below.
Main leftovers / next improvements are in [TODO.md](./TODO.md), we can dive
deeper from there.

## Design

### Editing

A single note contains a title, and a list of paragraphs.
The currently edited paragraph is displayed raw, all other paragraphs are markdown-rendered.

This was inspired by [roam research](http://roamresearch.com), and I myself prefer this way of editing text:
- no need to mess with WYSIWYG style editing where cursor's handling can get messy at the edges of non-raw-text tokens
  - e.g. even in slack, bolding some text, e.g. `foo *bar* baz`, and then wanting to add some text inside next to `bar` that would still be bold - if cursor is at `bar|`, and you start typing, the newly typed text will _not_ be bold.
    - point being - it's confusing, and requires more difficult input handling, which is an easy source of bugs. of course, UX differs from regular WYSIWYG, but myself I much prefer this way of editing.
- can still easily preview the final result by focusing a different paragraph / note

### Data

A note's data is encoded in JSON, which gets stringified and put into the "body" when being sent to the API. Same but reverse decoding happens when receiving data from the server.

The dataflow of the app looks like this:
- App fetches the initial list of notes
  - NoteList renders each
    - Note renders individual, allows editing.

Editable data is kept in Note's local state. When editing:
1. data gets synced with the server on a debounced timeout
1. data gets synced with the App's initial list of notes, so that:
	- a complete refetch of notes' data is not needed
	- search works
	- weird bugs of inconsistent state are avoided

The 2nd part is not ideal, but due to time constraints and disallowance of
external libraries, a refactor was out of scope.
See `syncNoteUpdateWithAPIAndParentState` in [src/store/note.ts](src/store/note.ts) for further discussion.

### Mobile-first

The app was developed in a mobile-first approach, simply because I believe it's
easier to add desktop support later on (which I did), rather than desktop-first
and mobile later.

### External libraries

As requested, no external libraries that would do heavy-lifting were used.
Actually, we're using the create-react-app's defaults, plus emotion, which
simply allows writing css directly in tsx files.

Biggest annoyance about this was was probably re-inventing solutions to common
rough edges in react, its data management (e.g. cannot perform async actions in
reducers), and not having a state management library at hand to help with this.
But that's part of the fun.
