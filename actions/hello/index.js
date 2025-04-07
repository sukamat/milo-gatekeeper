const { Core } = require('@adobe/aio-sdk')

async function main(params) {
    const logger = Core.Logger('main', { level: 'info' })

    try {
        logger.info('Calling the main action')
        const currentTime = new Date()
        logger.error(`Current time is ${currentTime.toLocaleString()}.`)

        return {
            body: {
                timeInMilliseconds: currentTime.getTime(),
                timeInString: currentTime.toLocaleString()
            }
        }
    } catch (error) {
        logger.error(error)
        return { error }
    }
}

exports.main = main;
