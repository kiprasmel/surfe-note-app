# TODO

- [ ] sanitize parsed markdown before rendering
- [ ] validate if markdown is valid, e.g. beginning bold without ending it
- [x] do not take away focus from note's title, if initially clicking on it
  - [ ] or, pitch this as a feature not a bug, and have a way to auto-generate title once user starts typing content
- [x] assign note id from api: have a temporary "clientID" for a note that we'll use to ensure the correct note will be updated (e.g. if >1 empty note is created before sending to server)
- [ ] user tagging: if cursor in `@[|]`, and user deletes via backspace (would become `@|]`), we should delete the matching bracket too (i.e. should become `@|`). same with the other bracket.
- [ ] user tagging: arrow keys should cycle thru items, instead of navigating to next/prev paragraph & breaking the flow.
- [ ] complete control over navigation between paragraphs - better cursor positioning, etc
- [ ] animation when a note is added/deleted
- [ ] support selection ranges (cursor begin & end at different positions)
  - [ ] then, add more action buttons - bold/italic/mention
- [ ] extend markdown parser - add links, note references
- [ ] data encryption
- [ ] error handling, e.g. server down
- [ ] offline-first support - save to local storage to avoid data loss, sync later
- [ ] related to previous 2 -- data synchronization difficulties, conflict resolution (event log with actions and timestamps? [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)s?)
