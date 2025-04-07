/**
 * Gatekeeper Action
 * 
 * Purpose: Validates Adobe IMS tokens and checks user permissions
 * 
 * Functionality:
 * - Validates Adobe IMS access tokens
 * - Fetches user profile information
 * - Verifies if the user is an Adobe employee
 * 
 * Input:
 * - access_token: Adobe IMS access token
 * - client_id: Adobe client ID
 * 
 * Output:
 * - User profile information
 * - Boolean indicating if the user is an Adobe employee
 * - Error messages if validation fails
 */

const { Ims } = require('@adobe/aio-lib-ims');
const { getAioLogger, errorResponse, checkMissingRequestInputs } = require('../utils');

async function main(params) {
    const logger = getAioLogger();
    
    // Validate parameters
    const requiredParams = ['access_token', 'client_id'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams);
    if (errorMessage) {
        return errorResponse(400, errorMessage);
    }

    const accessToken = params.access_token;
    const clientId = params.client_id;

    try {
        const ims = new Ims();
        const validation = await ims.validateToken(accessToken, clientId);

        if (!validation.valid) {
            return errorResponse(401, 'Invalid access token');
        }

        // Get user profile from IMS
        const profileResponse = await ims.post('/ims/profile/v1', accessToken, {
            client_id: clientId
        });

        // Check if user is an Adobe employee
        const isAdobeEmployee = profileResponse.email.endsWith('@adobe.com') && 
                               profileResponse.account_type === 'type3';

        return {
            statusCode: 200,
            body: {
                profile: profileResponse,
                isAdobeEmployee
            }
        };
    } catch (error) {
        logger.error('Error processing request:', error);
        return errorResponse(500, 'Error validating token or fetching profile', error);
    }
}

exports.main = main;