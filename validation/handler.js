'use strict';
const validateHelloPost = require('./schema/helloPost')

module.exports.hello = async (event) => {

  event.body = JSON.parse(event.body)

  if (!validateHelloPost(event.body)) {
    console.log(validateHelloPost.errors)
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: 'OpenAPI requestBody validation error',
          ajvError: validateHelloPost.errors
        },
        null,
        2
      ),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  }
}
