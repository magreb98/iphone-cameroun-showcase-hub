// server/middleware/errorHandler.js
const { BaseError } = require('sequelize'); // For Sequelize specific errors

const errorHandler = (err, req, res, next) => {
  console.error('ERROR LOG:', new Date().toISOString());
  console.error('Requested URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  if (req.body && Object.keys(req.body).length > 0) {
    // Basic redaction for common sensitive fields in logs
    const redactedBody = { ...req.body };
    if (redactedBody.password) redactedBody.password = '[REDACTED]';
    if (redactedBody.currentPassword) redactedBody.currentPassword = '[REDACTED]';
    if (redactedBody.newPassword) redactedBody.newPassword = '[REDACTED]';
    console.error('Request Body:', JSON.stringify(redactedBody, null, 2));
  }
  console.error(err.stack);

  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred.';

  if (isProduction) {
    // For Sequelize validation errors or constraint violations
    if (err instanceof BaseError) {
      statusCode = 400; // Bad Request for validation/constraint issues
      // message = 'There was an issue with your request. Please check your input.';
      // More specific messages can be crafted based on err.name or err.errors
      switch (err.name) {
        case 'SequelizeValidationError':
          message = 'Validation error: ' + err.errors.map(e => e.message).join(', ');
          break;
        case 'SequelizeUniqueConstraintError':
          message = 'A record with this value already exists: ' + err.errors.map(e => e.path).join(', ');
          break;
        case 'SequelizeForeignKeyConstraintError':
          message = 'Related record not found or cannot be changed.';
          statusCode = 400; // Or 404 if more appropriate for the context
          break;
        default:
          message = 'Database error. Please try again later.';
      }
    } else if (err.isOperational) { // Custom operational errors can be handled here
      // statusCode and message would be set on err directly
    } else { // Unknown errors
      statusCode = 500;
      message = 'Internal Server Error. Please try again later.';
    }
  } else { // Development environment
    // Send more detailed error, but be cautious
    message = err.message; // Or err.stack for even more detail, if desired
  }

  // Ensure statusCode is a valid HTTP status code number
  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    console.error(`Invalid statusCode "${statusCode}" from error, defaulting to 500.`);
    statusCode = 500;
  }

  res.status(statusCode).json({
    message: message,
    // Optionally include stack in dev, or specific error codes/types
    ...( !isProduction && err.stack && { stack: err.stack.split('\n').slice(0,5) } ), // Top 5 lines of stack in dev
    ...( !isProduction && err.name && { errorType: err.name })
  });
};

module.exports = errorHandler;
