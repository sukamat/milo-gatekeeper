const AioLogger = require('@adobe/aio-lib-core-logging');

/**
 * Returns an error response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} error - Error object (optional)
 * @returns {Object} Error response object
 */
function errorResponse(statusCode, message, error = {}) {
    return {
        error: {
            statusCode,
            message,
            error: error.message || error
        }
    }
}

/**
 * Checks if required parameters are present in the request
 * @param {Object} params - Request parameters
 * @param {Array} requiredParams - Array of required parameter names
 * @returns {string|null} Error message if parameters are missing, null otherwise
 */
function checkMissingRequestInputs(params, requiredParams = []) {
    if (!params) {
        return 'Missing request parameters'
    }

    const missingParams = requiredParams.filter(param => !params[param])
    if (missingParams.length > 0) {
        return `Missing required parameters: ${missingParams.join(', ')}`
    }

    return null
}

function getAioLogger(loggerName = 'main', logLevel = 'info') {
    return AioLogger(loggerName, { level: logLevel });
}

module.exports = {
    errorResponse,
    checkMissingRequestInputs,
    getAioLogger
} 