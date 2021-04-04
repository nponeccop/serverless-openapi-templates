'use strict';
const validateHelloPost = require('./schema/helloPost')

module.exports.hello = async (event) => {

  event.body = JSON.parse(event.body)
  console.log(validateHelloPost(event.body))

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
