const defaults = {}

const httpResponseSerializerMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts }

  const httpResponseSerializerMiddlewareAfter = async (request) => {
    // нормализуем заголовки для внутреннего использования
    // request.response = request.response || {}
    const headers = request.event.headers

    // определяем типы содержимого, которые требует клиент
    let preferredTypes

    // если requiredContentType передан явно, используем его
    if (request.event.requiredContentType) {
      preferredTypes = [].concat(request.event.requiredContentType)
    } else {
      // в противном случае определяем типы на основе предпочтений клиента
      // и типов по умолчанию, заданных в опциях
      preferredTypes = [].concat(
        [],
        request.event.preferredContentType || [],
        options.default || []
      )
    }

    // если не переданы типы содержимого, то ничего не делаем
    if (!preferredTypes.length) {
      return
    }

    // находим первый подходящий сериализатор для первого подходящего типа
    preferredTypes.find((preferredType) =>
      options.serializers.find((serializer) => {
        // проверяем, подходит ли тип содержимого для текущего сериализатора
        const matchesType = serializer.regex.test(preferredType)

        // если тип содержимого не соответствует сериализатору, переходим к следующему сериализатору
        if (!matchesType) {
          return false
        }

        // задаем тип содержимого в заголовках
        headers['Content-Type'] = preferredType
        // сериализуем ответ
        const serializedBody = serializer.serializer(request.response)

        // если сериализованный ответ - объект, заменяем текущий объект ответа целиком
        if (typeof serializedBody === 'object') {
          request.response = serializedBody
        } else {
          // иначе заменяем только тело ответа
          request.response.body = serializedBody
        }

        return true
      })
    )
  }

  // для удобства обработки ошибок используем ту же функцию, что и для after-хука
  const httpResponseSerializerMiddlewareOnError = httpResponseSerializerMiddlewareAfter

  return {
    after: httpResponseSerializerMiddlewareAfter,
    onError: httpResponseSerializerMiddlewareOnError
  }
}

module.exports = httpResponseSerializerMiddleware
