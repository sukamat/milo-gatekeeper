const { getAioLogger, errorResponse, checkMissingRequestInputs } = require('../utils');
const filesLib = require('@adobe/aio-lib-files');

async function main(params) {    
    const logger = getAioLogger();
    // Validate parameters
    const requiredParams = ['email']
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
        return errorResponse(400, errorMessage)
    }

    // Validate email format //
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(params.email)) {
        return errorResponse(400, 'Invalid email format')
    }

    try {
        // Initialize the files SDK
        const files = await filesLib.init()
        const emailStorageFile = 'data/emails.json'
        let existingEmails = []

        // Ensure emails.json exists, else create it with empty array
        try {
            await files.read(emailStorageFile)
        } catch (error) {
            if (error.code === 'ERROR_FILE_NOT_EXISTS') {
                await files.write(emailStorageFile, JSON.stringify([]))
            } else {
                throw error
            }            
        }

        // Read existing emails
        const fileContent = await files.read(emailStorageFile)
        existingEmails = JSON.parse(fileContent.toString())
        
        // Validate that the loaded content is an array
        if (!Array.isArray(existingEmails)) {
            existingEmails = []
            await files.write(emailStorageFile, JSON.stringify(existingEmails))
        }

        // Check if email already exists
        const newEmail = params.email.toLowerCase().trim()
        if (existingEmails.includes(newEmail)) {
            return {
                statusCode: 200,
                body: {
                    message: 'Email already exists in the list',
                    email: newEmail,
                    totalEmails: existingEmails.length,
                    allEmails: existingEmails
                }
            }
        }

        // Add new email and save
        existingEmails.push(newEmail)
        await files.write(emailStorageFile, JSON.stringify(existingEmails, null, 2))

        return {
            statusCode: 200,
            body: {
                message: 'Email added successfully',
                email: newEmail,
                totalEmails: existingEmails.length,
                allEmails: existingEmails
            }
        }

    } catch (error) {
        logger.error('Error processing request:', error)
        return errorResponse(500, 'Internal server error', error)
    }
}

exports.main = main
