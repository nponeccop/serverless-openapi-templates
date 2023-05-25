'use strict'

const middy = require('@middy/core')
const validator = require('./validatorMiddleware')
const inputSchema = require('./schema/validationPost.js')
const bodyParser = require('./body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const responseSerializer = require('./response-serializer')

const baseHandler = async (event) => {
  return {
    statusCode: 200,
    body: { xx: 'aaa' }
  }
}

const middyStack = middy(baseHandler)
  .use(bodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(responseSerializer({
    serializers: [
      {
        regex: /^application\/json$/,
        serializer: (body) => {
          if (body) {
            return JSON.stringify(body)
          }
          return ''
        }
      }
    ],
    default: 'application/json'
  }))

module.exports.handler = middyStack
