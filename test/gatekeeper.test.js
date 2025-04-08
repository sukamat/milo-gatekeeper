/* ************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2025 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
************************************************************************* */

const action = require('../actions/gatekeeper/index.js')

// Mock functions for IMS instance
const mockValidateToken = jest.fn()
const mockPost = jest.fn()

// Mock the Ims class
jest.mock('@adobe/aio-lib-ims', () => {
  return {
    Ims: jest.fn().mockImplementation(() => ({
      validateToken: mockValidateToken,
      post: mockPost
    }))
  }
})

describe('gatekeeper', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function)
  })

  test('should return 400 when required parameters are missing', async () => {
    const response = await action.main({})
    expect(response).toEqual({
      error: {
        statusCode: 400,
        message: 'Missing required parameters: access_token, client_id',
        error: {}
      }
    })
  })

  test('should return 401 when token is invalid', async () => {
    mockValidateToken.mockResolvedValueOnce({ valid: false })
    
    const params = {
      access_token: 'invalid-token',
      client_id: 'test-client-id'
    }
    
    const response = await action.main(params)
    expect(response).toEqual({
      error: {
        statusCode: 401,
        message: 'Invalid access token',
        error: {}
      }
    })
  })

  test('should return user profile and employee status when token is valid', async () => {
    mockValidateToken.mockResolvedValueOnce({ valid: true })
    mockPost.mockResolvedValueOnce({
      email: 'test@adobe.com',
      account_type: 'type3'
    })
    
    const params = {
      access_token: 'valid-token',
      client_id: 'test-client-id'
    }
    
    const response = await action.main(params)
    expect(response).toEqual({
      statusCode: 200,
      body: {
        profile: {
          email: 'test@adobe.com',
          account_type: 'type3'
        },
        isAdobeEmployee: true
      }
    })
  })

  test('should return false for isAdobeEmployee when user is not an Adobe employee', async () => {
    mockValidateToken.mockResolvedValueOnce({ valid: true })
    mockPost.mockResolvedValueOnce({
      email: 'test@example.com',
      account_type: 'type1'
    })
    
    const params = {
      access_token: 'valid-token',
      client_id: 'test-client-id'
    }
    
    const response = await action.main(params)
    expect(response).toEqual({
      statusCode: 200,
      body: {
        profile: {
          email: 'test@example.com',
          account_type: 'type1'
        },
        isAdobeEmployee: false
      }
    })
  })

  test('should handle errors during token validation or profile fetch', async () => {
    const error = new Error('Validation failed')
    mockValidateToken.mockRejectedValueOnce(error)
    
    const params = {
      access_token: 'valid-token',
      client_id: 'test-client-id'
    }
    
    const response = await action.main(params)
    expect(response).toEqual({
      error: {
        statusCode: 500,
        message: 'Error validating token or fetching profile',
        error: 'Validation failed'
      }
    })
  })
})
