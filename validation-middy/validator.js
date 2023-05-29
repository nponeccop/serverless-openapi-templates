const defaults = {
  inputSchema: null,
  outputSchema: null,
  ajvOptions: {},
  ajvInstance: undefined,
  defaultLanguage: 'en'
}

const validatorMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts }
  const inputSchema = options.inputSchema
  const outputSchema = options.outputSchema
  const validatorMiddlewareBefore = async (request) => {
    const valid = inputSchema(request.event.body)
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