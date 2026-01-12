const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Role-Based Access Dashboard API',
      version: '1.0.0',
      description: 'Express API with JWT authentication and RBAC-protected dashboards.',
    },
  },
  apis: ['./src/routes/**/*.js'], // Include nested routes for docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

