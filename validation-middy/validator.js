const defaults = {
  inputSchema: null,
  outputSchema: null,
  ajvOptions: {},
  ajvInstance: undefined,
  defaultLanguage: 'en'
}

const validatorMiddleware = (opts = {}) => {
  const {
    inputSchema,
    outputSchema
  } = { ...defaults, ...opts }

  const validatorMiddlewareBefore = async (request) => {
    // console.log(request.event)
    const valid = inputSchema(request.event)

    if (!valid) {
      const error = new Error('Event object failed validation')
      request.event.headers = { ...request.event.headers }

      error.details = inputSchema.errors
      throw error
    }
  }

  const validatorMiddlewareAfter = async (request) => {
    const valid = outputSchema(request.response)

    if (!valid) {
      const createError = require('http-errors')
      const error = new createError.InternalServerError(
        'Response object failed validation'
      )
      error.details = outputSchema.errors
      error.response = request.response
      throw error
    }
  }
  return {
    before: inputSchema ? validatorMiddlewareBefore : null,
    after: outputSchema ? validatorMiddlewareAfter : null
  }
}

module.exports = validatorMiddleware
