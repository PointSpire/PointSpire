# PointSpire

## Structural Information

- Model (Backend)
   - MongoDB with MLab as our basis for now
- Controller (Backend)
   - Node.js on Heroku free, just 1 server (dyno) is needed. No cost for 1 server running all month.
   - REST API
      - Express
      - Swagger for API front-end
- Front Controller (Front-end)
   - React
- View (Front-end)
   - React
   - Material-UI

## Project Artifacts

- [Data Model Diagram](https://drive.google.com/file/d/1Tg2oqtFEII-8tDwPRz2UPc-ru1ZW962t/view?usp=sharing)
- [Scrum Board](https://tree.taiga.io/project/aneuhold-pointspire/backlog)

## Contribution Guidelines

To contribute to the project, we generally use the scrum board linked above and work in sprints. Please message someone on the team if you would like to join in 😁. But, if you wish to make individual contributions we only ask that the [quality policy](https://github.com/PointSpire/PointSpire/blob/master/docs/QualityPolicy.md) is followed and the ESLint rules in the project are used.

To get started with development, please start at the `package.json` file for the part of the project you wish to contribute to. That has details on the different npm commands that can be used and helps explain how the build process works. Note that the `node_server` generally runs on port 8055, and the `client` runs on port 3000 so they don't conflict. 