'use strict';

// Подключение модуля с валидацией тела запроса
const validatePost = require('./schema/validationPost')
// Функция для создания JSON-ответа
const jsonResponse = ({ statusCode, body }) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body, null, 2)
  }
}

// Функция-обертка для валидации и обработки JSON-запросов
const jsonWrap = (validator, handler) => async (event) => {
  try {
    // Попытка распарсить тело запроса
    event.body = JSON.parse(event.body)
  }
  catch (e) {
    // Ошибка при парсинге JSON-запроса
    return jsonResponse({
      statusCode: 400,
      body:
      {
        message: 'JSON parsing error'
        , details: e.message
      }
    })
  }
  // console.log(validator.errors, validator(event.body))
  // Проверка тела запроса с помощью валидатора
  validator.errors = null
  if (!validator(event.body)) {
    // Ошибка валидации тела запроса
    return jsonResponse({
      statusCode: 400,
      body:
      {
        message: 'OpenAPI requestBody validation error'
        , details: validator.errors
      }
    })
  }
  // Обработка валидного JSON-запроса с помощью переданного обработчика
  return jsonResponse(await handler(event))
}

// Экспорт обработчика запроса hello
const validation = jsonWrap(validatePost, async (event) => {
  console.log(event)
  return {
    statusCode: 200,
    body: {
      message: `All Good`,
      input: event
    }
  }
})

module.exports = {
  handler: validation
}
