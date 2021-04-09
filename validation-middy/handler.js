'use strict'

const middy = require('@middy/core')
const validator = require('./validator')
const inputSchema = require('./schema/helloPost')
const bodyParser = require('./body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const responseSerializer = require('./response-serializer')

const middyStack = (handler) => middy(handler)
  .use(bodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(responseSerializer({
    serializers: [
      {
        regex: /^application\/json$/,
        serializer: ({ body }) => JSON.stringify(body)
      }
    ],
    default: 'application/json'
  }))

const baseHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify({ xx: 'aaa' }) }
}

module.exports.hello = middyStack(baseHandler)
