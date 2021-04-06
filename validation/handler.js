'use strict';
const validateHelloPost = require('./schema/helloPost')

const jsonResponse = ({statusCode, body}) => {
  return {
    statusCode: 400,
    body: JSON.stringify( body, null, 2)
  }
}

const jsonWrap = (validator, handler) => async (event) => {
  try {
    event.body = JSON.parse(event.body)
  }
  catch (e) {
    return jsonResponse({
      statusCode: 400,
      body:
        { message: 'JSON parsing error'
        , details: e.message
        }
    })
  }

  validator.errors = null
  if (!validator(event.body)) {
    console.log(validator.errors)
    return jsonResponse({
      statusCode: 400,
      body:
        { message: 'OpenAPI requestBody validation error'
        , ajvError: validator.errors
        }
      })
  }
  return jsonResponse(await handler(event))
}

module.exports.hello = jsonWrap(validateHelloPost, async (event) => {

  return {
    statusCode: 200,
    body:
      {
        message: 'Go Serverless! Your function executed successfully!',
        input: event,
      }
    }
})
