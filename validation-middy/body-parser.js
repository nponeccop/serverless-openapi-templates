
const httpJsonBodyParserMiddleware = (types = { 'application/json; encoding: utf-8': null }) => {

  const httpJsonBodyParserMiddlewareBefore = async (request) => {
    const contentTypeHeader = request.event.headers['content-type']
    if (contentTypeHeader in types) {
        try {
          const data = request.event.isBase64Encoded
            ? Buffer.from(request.event.body, 'base64').toString()
            : request.event.body
          request.event.body = JSON.parse(data)
        } catch (err) {
          throw new Error(
            'Content type defined as JSON but an invalid JSON was provided'
          )
        }
    }
    else
    {
      throw new Error("It's a bug in serverless-offline!")
    }
  }
  return {
    before: httpJsonBodyParserMiddlewareBefore
  }
}
module.exports = httpJsonBodyParserMiddleware
