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
      tagIdParam: {
        name: 'tagId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
    },
    schemas: {
      document: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          __v: {
            type: 'integer',
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
          currentTags: {
            $ref: '#/components/schemas/userObjectTags',
          },
          filters: {
            $ref: '#/components/schemas/userObjectFilters',
          },
        },
      },
      userObjectTags: {
        type: 'object',
        description:
          'An object with key value pairs where the key is the tag ID and the value is the properties of the tag',
        additionalProperties: {
          type: 'object',
          properties: {
            color: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
      userObjectFilters: {
        type: 'object',
        description: 'The filters that the user has set',
        properties: {
          showFutureStartDates: {
            type: 'boolean',
          },
          showCompletedTasks: {
            type: 'boolean',
          },
          tagIdsToShow: {
            type: 'array',
            items: {
              type: 'string',
            },
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
              $ref: '#/components/schemas/completableObjectResponse',
            },
          },
          tasks: {
            type: 'object',
            description: 'The key is the ID for the task to make access faster',
            additionalProperties: {
              $ref: '#/components/schemas/completableObjectResponse',
            },
          },
        },
      },
      userObjectResponseBasis: {
        allOf: [
          {
            $ref: '#/components/schemas/document',
          },
          {
            $ref: '#/components/schemas/userObjectBasis',
          },
          {
            type: 'object',
            properties: {
              dateCreated: {
                description:
                  'A Date string representing the date this user was created. This can be used as a valid Date object in JavaScript.',
                type: 'string',
              },
            },
          },
        ],
      },
      userObjectWithIds: {
        allOf: [
          {
            $ref: '#/components/schemas/userObjectResponseBasis',
          },
          {
            $ref: '#/components/schemas/userObjectProjectIds',
          },
        ],
      },
      completableObjectBasis: {
        type: 'object',
        properties: {
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
              'A Date string that represents when this completable should be started',
          },
          dueDate: {
            type: 'string',
            nullable: true,
            description:
              'A Date string that represents when this completable is due',
          },
          tags: {
            $ref: '#/components/schemas/completableTags',
          },
        },
      },
      completableTags: {
        type: 'array',
        description: 'An array of tagIds for this completable',
        items: {
          type: 'string',
        },
      },
      completableTitle: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
        },
      },
      completableRequiredTitle: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
          },
        },
      },
      completableObjectTaskIds: {
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
      completableObjectPostBody: {
        allOf: [
          {
            $ref: '#/components/schemas/completableRequiredTitle',
          },
          {
            $ref: '#/components/schemas/completableObjectBasis',
          },
        ],
      },
      completableObjectPatchBody: {
        allOf: [
          {
            $ref: '#/components/schemas/completableTitle',
          },
          {
            $ref: '#/components/schemas/completableObjectBasis',
          },
        ],
      },
      completableObjectResponse: {
        allOf: [
          {
            $ref: '#/components/schemas/document',
          },
          {
            $ref: '#/components/schemas/completableTitle',
          },
          {
            $ref: '#/components/schemas/completableObjectBasis',
          },
          {
            $ref: '#/components/schemas/completableObjectTaskIds',
          },
        ],
      },
      validationResponse: {
        type: 'object',
        properties: {
          validated: {
            type: 'boolean',
          },
          err: {
            type: 'object',
            required: false,
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
