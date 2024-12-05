# note-app

https://note.kipras.org

## setup

- tested with node v16

```sh
git clone https://github.com/kiprasmel/surfe-note-app
cd surfe-note-app

yarn
yarn setup

yarn start
```

## notes

Commits are separated pretty well for reviewing & seeing thru the history,
thought there's quite a few of them.

Main leftovers / next improvements are in [TODO.md](./TODO.md), can dive deeper
from there.

Most annoying was probably re-inventing solutions to common rough edges in
react, its data management (e.g. cannot perform async actions in reducers), and
not having a state management library at hand to help with this. But that's part
of the fun.
