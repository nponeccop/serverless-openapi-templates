'use strict';
const validateHelloPost = require('./schema/helloPost')

const jsonResponse = ({statusCode, body}) => {
  return {
    statusCode: 400,
    body: JSON.stringify( body, null, 2)
  }
}

module.exports.hello = async (event) => {

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

  if (!validateHelloPost(event.body)) {
    console.log(validateHelloPost.errors)
    return jsonResponse({
      statusCode: 400,
      body:
        { message: 'OpenAPI requestBody validation error'
        , ajvError: validateHelloPost.errors
        }
      })
  }

  return jsonResponse({
    statusCode: 200,
    body:
      {
        message: 'Go Serverless! Your function executed successfully!',
        input: event,
      }
    })
}
