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

async function main(params) {
  const accessToken = params.access_token;
  const clientId = params.client_id;

  if (!accessToken) {
    return {
      statusCode: 401,
      body: {
        error: 'Missing access token'
      }
    };
  }

  if (!clientId) {
    return {
      statusCode: 400,
      body: {
        error: 'Missing client ID'
      }
    };
  }

  try {
    const ims = new Ims();
    const validation = await ims.validateToken(accessToken, clientId);

    if (!validation.valid) {
      return {
        statusCode: 401,
        body: {
          error: 'Invalid access token'
        }
      };
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
    return {
      statusCode: 500,
      body: {
        error: 'Error validating token or fetching profile',
        details: error.message
      }
    };
  }
}

exports.main = main;