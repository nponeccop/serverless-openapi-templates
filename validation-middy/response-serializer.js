const defaults = {}

const httpResponseSerializerMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts }

  const httpResponseSerializerMiddlewareAfter = async (request) => {
    // Normalize headers for internal use
    request.response = request.response || {}
    const headers = request.event.headers

    // Determine the preferred content types requested by the client
    let preferredTypes

    // If requiredContentType is explicitly provided, use it
    if (request.event.requiredContentType) {
      preferredTypes = [].concat(request.event.requiredContentType)
    } else {
      // Otherwise, determine the types based on client preferences
      // and default types specified in the options
      preferredTypes = [].concat(
        [],
        request.event.preferredContentType || [],
        options.default || []
      )
    }

    // If no content types are provided, do nothing
    if (!preferredTypes.length) {
      return
    }

    // Find the first matching serializer for the first matching type
    preferredTypes.find((preferredType) =>
      options.serializers.find((serializer) => {
        // Check if the content type matches the current serializer
        const matchesType = serializer.regex.test(preferredType)

        // If the content type does not match the serializer, move to the next serializer
        if (!matchesType) {
          return false
        }

        // Set the content type in the headers
        headers['Content-Type'] = preferredType
        // Serialize the response
        const serializedBody = serializer.serializer(request.response)

        // If the serialized response is an object, replace the current response object entirely
        if (typeof serializedBody === 'object') {
          request.response = serializedBody
        } else {
          // Otherwise, only replace the response body
          request.response.body = serializedBody
        }

        return true
      })
    )
  }

  // Use the same function for error handling as the after-hook for convenience
  const httpResponseSerializerMiddlewareOnError = httpResponseSerializerMiddlewareAfter

  return {
    after: httpResponseSerializerMiddlewareAfter,
    onError: httpResponseSerializerMiddlewareOnError
  }
}

module.exports = httpResponseSerializerMiddleware

