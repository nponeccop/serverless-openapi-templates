const parse = (contentTypeHeader) => {
 const idx = contentTypeHeader.indexOf(';')
 return idx >= 0 ? contentTypeHeader.substring(0, idx) : contentTypeHeader
}

const httpJsonBodyParserMiddleware = (types = { 'application/json': null }) => {

  const httpJsonBodyParserMiddlewareBefore = async (request) => {
    const contentTypeHeader = request.event.headers['content-type']
    const contentType = parse(contentTypeHeader)
    console.log({ contentType })
    if (contentType in types) {
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
