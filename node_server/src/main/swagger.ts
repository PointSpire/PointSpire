import swaggerJSDoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  servers: [
    {
      url: 'http://localhost:8055/api',
      description: 'Local Development Server',
    },
  ],
  info: {
    version: '1.0.1',
    title: 'PointSpire API',
    description: 'API for querying the MongoDB for PointSpire',
  },
  components: {
    parameters: {
      userIdParam: {
        name: 'userId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
      projectIdParam: {
        name: 'projectId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
    },
    schemas: {
      userObjectBasis: {
        type: 'object',
        properties: {
          userName: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          githubId: {
            type: 'string',
          },
          dateCreated: {
            description:
              'A Date string representing the date this user was created. This can be used as a valid Date object in JavaScript.',
            type: 'string',
          },
          _id: {
            type: 'string',
          },
          __v: {
            type: 'integer',
          },
        },
      },
      userObjectProjectIds: {
        type: 'object',
        properties: {
          projects: {
            type: 'array',
            description:
              'An array of ObjectIds associated with the projects under this user.',
            items: {
              type: 'string',
            },
          },
        },
      },
      userObjectProjects: {
        type: 'object',
        properties: {
          projects: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/projectObjectWithTasks',
            },
          },
        },
      },
      userObjectWithIds: {
        allOf: [
          {
            $ref: '#/components/schemas/userObjectBasis',
          },
          {
            $ref: '#/components/schemas/userObjectProjectIds',
          },
        ],
      },
      userObjectWithProjects: {
        allOf: [
          {
            $ref: '#/components/schemas/userObjectBasis',
          },
          {
            $ref: '#/components/schemas/userObjectProjects',
          },
        ],
      },
      projectObjectBasis: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
          date: {
            type: 'object',
            description:
              'A Date object representing the date this project was created.',
          },
        },
      },
      projectObjectTaskIds: {
        type: 'object',
        properties: {
          subtasks: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      projectObjectTasks: {
        type: 'object',
        properties: {
          subtasks: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/taskObject',
            },
          },
        },
      },
      projectObjectWithIds: {
        allOf: [
          {
            $ref: '#/components/schemas/projectObjectBasis',
          },
          {
            $ref: '#/components/schemas/projectObjectTaskIds',
          },
        ],
      },
      projectObjectWithTasks: {
        allOf: [
          {
            $ref: '#/components/schemas/projectObjectBasis',
          },
          {
            $ref: '#/components/schemas/projectObjectTasks',
          },
        ],
      },
      taskObject: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
          date: {
            type: 'object',
            description:
              'A Date object representing the date this task was created.',
          },
        },
      },
    },
  },
};

const options = {
  definition,
  apis: ['./src/main/routes/*.ts'],
};

export default swaggerJSDoc(options);
