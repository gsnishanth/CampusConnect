/**
 * Send a successful JSON response.
 * @param {Object} res - Express response object
 * @param {*} data - Payload to send
 * @param {string} message - Human-readable message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error JSON response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {Array|Object|null} errors - Optional detailed errors
 */
const error = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
  };
  if (errors !== null) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
};

module.exports = { success, error };
