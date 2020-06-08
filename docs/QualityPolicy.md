# Quality Policy

This document covers various quality guidelines in the development process for PointSpire.

- Use TypeScript where possible

## Git

- `master` branch: Should always have at least one review before a pull request is merged. Also should only be fast-forwards with whatever is pulling into it. 
- `development` branch: Should be used during sprints and merged into master at the end of a sprint.
- `documents` branch: Can be used to update just documentation. This should merge into master, then merge from master into development if it is during a sprint.

### Pull Request Review Template:

```
### Review
Some comment here about the pull request

### Reviewer Checklist
- [ ] Comments are comprehensible and add something to the maintainability of the code (trivial comments do not help, rather write readable code). Also JSDoc comments are present. 
- [ ] The pull request is a fast forward for the branch being merged into
- [ ] Types have been generalized where possible
- [ ] Exceptions have been used appropriately
- [ ] Repetitive code has been factored out
- [ ] Frameworks have been used appropriately – methods have all been defined appropriately
- [ ] Unit tests are present and correct
- [ ] Tests have been run locally to make sure they pass
- [ ] Code fulfills acceptance criteria for the User Story
```

## Continuous Integration

- Make sure Travis CI passes before merging a pull request

## Static Analysis

- Use ESLint to lint code before comitting