const fs = require('fs')

const YAML = require('yamljs')
const assert = require('assert')

const fileName = 'minimal.yml'
const account = 123456

const file = fs.readFileSync(fileName, 'utf8')

const eachKvo = (o, f) => {
  for (let a of Object.keys(o)) f(a, o[a], o)
}

exports.openapiJSON = async ({ options, resolveConfigurationProperty }) => {
  const region = options.region
    || await resolveConfigurationProperty(['provider', 'region'])
    || 'us-east-1'
  const minimal = YAML.parse(file)
  const service = await resolveConfigurationProperty(['service'])

  const lambdaPrefix = `${service}-dev`

  eachKvo(minimal.paths, (path, v, o) => {
    eachKvo(v, (method, v, o) => {
      const { "function" : ff } = v['x-serverless.com']
      delete v['x-serverless.com']
      v['x-amazon-apigateway-integration'] = {
            "payloadFormatVersion": "2.0",
            "type": "aws_proxy",
            "httpMethod": method.toUpperCase(),
        "uri": `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${account}:function:${lambdaPrefix}-${ff}/invocations`,
            "connectionType": "INTERNET"
      }
    })
  })
  return minimal
}

exports.functions = async ({ options, resolveConfigurationProperty }) => {
  const minimal = YAML.parse(file)
  const functions = {}

  eachKvo(minimal.paths, (path, v, o) => {
    eachKvo(v, (method, v, o) => {

      const vv = v['x-serverless.com']
      const ff = vv['function']
      delete vv['function']

      functions[ff] = vv
    })
  })
  return { hello: { handler: 'handler.hello' } }
  





}
