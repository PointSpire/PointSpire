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
  tags: [
    {
      name: 'User',
      description: 'User operations',
    },
    {
      name: 'Project',
      description: 'Project operations',
    },
    {
      name: 'Task',
      description: 'Task operations',
    },
  ],
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
      taskIdParam: {
        name: 'taskId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
    },
    schemas: {
      userObjectPatchBody: {
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
          settings: {
            $ref: '#/components/schemas/userObjectSettings',
          },
        },
      },
      userObjectSettings: {
        type: 'object',
        properties: {
          yellowGreenTasks: {
            type: 'boolean',
          },
          notesExpanded: {
            type: 'boolean',
          },
        },
      },
      allUserDataObject: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/userObjectWithIds',
          },
          projects: {
            type: 'object',
            description:
              'The key is the ID for the project to make access faster',
            additionalProperties: {
              $ref: '#/components/schemas/projectObjectWithIds',
            },
          },
          tasks: {
            type: 'object',
            description: 'The key is the ID for the task to make access faster',
            additionalProperties: {
              $ref: '#/components/schemas/taskObjectWithIds',
            },
          },
        },
      },
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
          settings: {
            $ref: '#/components/schemas/userObjectSettings',
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
      projectObjectRequestBody: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
          priority: {
            type: 'number',
          },
          startDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this project should be started',
          },
          dueDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this project is due',
          },
        },
        example: {
          title: 'Fix the fence',
          note: 'Need to visit the store to see what kind of wood they have',
        },
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
          priority: {
            type: 'number',
          },
          startDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this project should be started',
          },
          dueDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this project is due',
          },
          dateCreated: {
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
      taskObjectRequestBody: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
          priority: {
            type: 'number',
          },
          startDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this task should be started',
          },
          dueDate: {
            type: 'string',
            nullable: true,
            description: 'A Date string that represents when this task is due',
          },
        },
        example: {
          title: 'Get geared up for next battle',
          note: 'Should get:\n- Helment\n- New Sword\n- New Shield',
          priority: 2,
        },
      },
      taskObjectBasis: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
          priority: {
            type: 'number',
          },
          dateCreated: {
            type: 'object',
            description:
              'A Date object representing the date this task was created.',
          },
          startDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this task should be started',
          },
          dueDate: {
            type: 'string',
            nullable: true,
            description: 'A Date string that represents when this task is due',
          },
        },
      },
      taskObjectTaskIds: {
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
      taskObjectPrereqIds: {
        type: 'object',
        properties: {
          prereqTasks: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      taskObjectWithIds: {
        allOf: [
          {
            $ref: '#/components/schemas/taskObjectBasis',
          },
          {
            $ref: '#/components/schemas/taskObjectTaskIds',
          },
          {
            $ref: '#/components/schemas/taskObjectPrereqIds',
          },
        ],
      },
    },
  },
};

const options = {
  definition,
  apis: ['./src/main/routes/*.ts'],
};

export default swaggerJSDoc(options);
