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
};

const options = {
  definition,
  apis: ['./src/main/routes/*.ts'],
};

export default swaggerJSDoc(options);
