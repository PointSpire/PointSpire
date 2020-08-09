# Quality Policy

This document covers various quality guidelines in the development process for PointSpire.

- Use TypeScript where possible

## Git

- Pull request reviews: If there is time, then a full review using the Pull Request Review Template below should be used. Otherwise, a quick note on the pull request with any comments can be posted.
- `master` branch: Pull requests should always have reviews from the 3 primary team members before a merge. Also should only be fast-forwards with whatever is pulling into it. 
- `development` branch: Pull requests should have idealy at least one review before a merge. If after 24 hours there are no reviews, it can be merged. Once the development branch has at least one pull request merged, a pull request can be made to the master branch. More pull requests can be made into development while an active pull request into master has been made. This branch should not be deleted.
- `documents` branch: Can be used to update just documentation. This should merge into master, then merge from master into development. This branch should never be deleted.
- User Stories: User stories should be made in Issues on the project while tagging the main project for PointSpire. Branches should be named according to the issue they are referencing: `I<issue number>-ShortDescription`. For example `I60-SwaggerAPIFrontEnd`.
- Once an issue branch is pulled into the development branch, it should be deleted to reduce branch clutter.
- Commits should follow the [standard commit guidelines](https://chris.beams.io/posts/git-commit/) with the added stipulation that every commit should have the isssue prepended to the commit title. For example a commit title could be `I60 Update .travis.yml to include client`. This makes it easier to determine the reasoning behind a commit in the short title because you can always reference the issue that the commit is working to accomplish.

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