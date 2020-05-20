# Quality Policy

This document covers various quality guidelines in the development process for PointSpire.

- Use TypeScript where possible

## Git

- `master` branch: Should always have at least one review before a pull request is merged. Also should only be fast-forwards with whatever is pulling into it. 
- `development` branch: Should be used during sprints and merged into master at the end of a sprint.
- `documents` branch: Can be used to update just documentation. This should merge into master, then merge from master into development if it is during a sprint.

## Continuous Integration

- Make sure Travis CI passes before merging a pull request

## Static Analysis

- Use ESLint to lint code before comitting