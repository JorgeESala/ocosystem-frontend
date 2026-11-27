## Release

> The agent may merge this PR only after the human explicitly says "merge to main".

<!-- One line: what this release ships and why. -->

### Included

- [ ] PR # — feature
- [ ] PR # — feature

### Deploy order

1. Backend, if this release needs an API change
2. Frontend
3. Branch app manifest, if this release includes an app version

### Verification

- [ ] CI green on the dev tip `<sha>`
- [ ] Changed-line coverage gate passed
- [ ] Tested on dev: <!-- what was tested and by whom -->

### Risks and rollback

- <!-- What could break, and how to roll back. -->

### After merge

- [ ] Sync `main` back into `dev`
- [ ] Verify the production site and the main flows
