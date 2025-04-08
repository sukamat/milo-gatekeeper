/* ************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2024 Adobe
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

// Mock the files SDK
jest.mock('@adobe/aio-lib-files')

const action = require('../actions/allowlist/index.js')
const filesLib = require('@adobe/aio-lib-files')

describe('allowlist', () => {
    let mockFiles

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        
        // Get fresh mock for each test
        mockFiles = {
            read: jest.fn(),
            write: jest.fn().mockResolvedValue()
        }
        filesLib.init.mockResolvedValue(mockFiles)
    })

    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function)
    })

    test('should return 400 when required parameters are missing', async () => {
        const response = await action.main({})
        expect(response).toEqual({
            error: {
                statusCode: 400,
                message: 'Missing required parameters: email',
                error: {}
            }
        })
    })

    test('should return 400 when email format is invalid', async () => {
        const params = {
            email: 'invalid-email'
        }
        
        const response = await action.main(params)
        expect(response).toEqual({
            error: {
                statusCode: 400,
                message: 'Invalid email format',
                error: {}
            }
        })
    })

    test('should create new file when emails.json does not exist', async () => {
        // First read fails with file not found
        mockFiles.read.mockRejectedValueOnce({ code: 'ERROR_FILE_NOT_EXISTS' })
        // Second read returns the empty array we just created
        mockFiles.read.mockResolvedValueOnce(Buffer.from('[]'))
        
        const params = {
            email: 'test@example.com'
        }
        
        const response = await action.main(params)
        
        // Verify the empty array was written first
        expect(mockFiles.write.mock.calls[0]).toEqual(['data/emails.json', '[]'])
        // Verify the email was added in the second write
        expect(mockFiles.write.mock.calls[1]).toEqual([
            'data/emails.json',
            JSON.stringify(['test@example.com'], null, 2)
        ])
        
        expect(response).toEqual({
            statusCode: 200,
            body: {
                message: 'Email added successfully',
                email: 'test@example.com',
                totalEmails: 1,
                allEmails: ['test@example.com']
            }
        })
    })

    test('should handle existing emails.json with invalid content', async () => {
        mockFiles.read.mockResolvedValue(Buffer.from('invalid json'))
        
        const params = {
            email: 'test@example.com'
        }
        
        const response = await action.main(params)
        expect(response).toEqual({
            error: {
                statusCode: 500,
                message: 'Internal server error',
                error: expect.any(String)
            }
        })
    })

    test('should add new email to empty list', async () => {
        // First read succeeds
        mockFiles.read.mockResolvedValueOnce(Buffer.from('[]'))
        // Second read returns the empty array
        mockFiles.read.mockResolvedValueOnce(Buffer.from('[]'))
        
        const params = {
            email: 'test@example.com'
        }
        
        await action.main(params)
        
        // Verify the email was added
        expect(mockFiles.write).toHaveBeenLastCalledWith(
            'data/emails.json',
            JSON.stringify(['test@example.com'], null, 2)
        )
    })

    test('should not add duplicate email', async () => {
        const existingEmails = ['test@example.com']
        mockFiles.read.mockResolvedValue(Buffer.from(JSON.stringify(existingEmails)))
        
        const params = {
            email: 'test@example.com'
        }
        
        const response = await action.main(params)
        expect(mockFiles.write).not.toHaveBeenCalled()
        expect(response).toEqual({
            statusCode: 200,
            body: {
                message: 'Email already exists in the list',
                email: 'test@example.com',
                totalEmails: 1,
                allEmails: ['test@example.com']
            }
        })
    })

    test('should normalize email case', async () => {
        // Setup mock to handle file operations
        mockFiles.read
            .mockRejectedValueOnce({ code: 'ERROR_FILE_NOT_EXISTS' }) // First read fails
            .mockResolvedValueOnce(Buffer.from('[]')) // Second read succeeds
        
        const params = {
            email: 'Test@Example.COM'
        }
        
        const response = await action.main(params)
        
        // Verify the sequence of operations
        expect(mockFiles.write).toHaveBeenCalledTimes(2)
        expect(mockFiles.write.mock.calls[0]).toEqual(['data/emails.json', '[]'])
        expect(mockFiles.write.mock.calls[1]).toEqual([
            'data/emails.json',
            JSON.stringify(['test@example.com'], null, 2)
        ])
        
        expect(response).toEqual({
            statusCode: 200,
            body: {
                message: 'Email added successfully',
                email: 'test@example.com',
                totalEmails: 1,
                allEmails: ['test@example.com']
            }
        })
    })

    test('should handle file system errors', async () => {
        const error = new Error('File system error')
        mockFiles.read.mockRejectedValue(error)
        
        const params = {
            email: 'test@example.com'
        }
        
        const response = await action.main(params)
        expect(response).toEqual({
            error: {
                statusCode: 500,
                message: 'Internal server error',
                error: 'File system error'
            }
        })
    })
}) 