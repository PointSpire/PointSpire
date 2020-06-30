# Quality Policy

This document covers various quality guidelines in the development process for PointSpire.

- Use TypeScript where possible

## Git

- Pull request reviews: If there is time, then a full review using the Pull Request Review Template below should be used. Otherwise, a quick note on the pull request with any comments can be posted.
- `master` branch: Pull requests should always have idealy at least one review before a merge. If after 24 hours there are no reviews, it can be merged. Also should only be fast-forwards with whatever is pulling into it. 
- `development` branch: Should be used during sprints and merged into master at the end of a sprint. Pull requests should have idealy at least one review before a merge. If after 24 hours there are no reviews, it can be merged.
- `documents` branch: Can be used to update just documentation. This should merge into master, then merge from master into development if it is during a sprint. This branch should never be deleted.
- User story and task branches should be created off of the current development branch. If a user story will be completed all at once, then it can simply be named with `US<user story number>-ShortDescription`. For example `US60-SwaggerAPIFrontEnd`. If a branch should be made for a specific task it should have the user story then the task number, so `US<user stoory number>T<task number>-ShortDescription`. For example `US65T72-GithubAuthenticationBackend`.
- Once a user story or task branch is pulled into the development branch, it should be deleted to reduce branch clutter.
- Commits should follow the [standard commit guidelines](https://chris.beams.io/posts/git-commit/) with the added stipulation that every commit should have the user story and task number prepended to the commit title. For example a commit title could be `US66T74 Update .travis.yml to include client`. This makes it easier to determine the reasoning behind a commit in the short title because you can always reference the user story or task that the commit is working to accomplish.

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

## Unit Testing

- Use Mocha and Chai on the `node_server` for unit testing
- Use Jest or Zomebie.js for the `client`? Still deciding as a team on how to do testing for the front-end.