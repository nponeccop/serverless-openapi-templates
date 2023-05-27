const headerParser = require('content-type')

const parse = a => headerParser.parse(a).type

const httpJsonBodyParserMiddleware = (types = { 'application/json': null }) => {
  const httpJsonBodyParserMiddlewareBefore = async (request) => {
    const contentTypeHeader = request.event.headers['Content-Type']
    const contentType = parse(contentTypeHeader)
    if (contentType in types) {
      try {
        const data = request.event.isBase64Encoded
          ? Buffer.from(request.event.body, 'base64').toString()
          : request.event.body
        request.event.body = JSON.parse(data)
      } catch (err) {
        const createError = require('http-errors')
        throw new createError.UnprocessableEntity('Content type defined as JSON but an invalid JSON was provided')
      }
    } else {
      throw new Error("It's a bug in serverless-offline!")
    }
  }
  return {
    before: httpJsonBodyParserMiddlewareBefore
  }
}
module.exports = httpJsonBodyParserMiddleware