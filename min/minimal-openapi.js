const fs = require('fs')

const YAML = require('yamljs')
const assert = require('assert')

const fileName = 'minimal.yml'

const file = fs.readFileSync(fileName, 'utf8')

const eachKv = (o, f) => {
  for (let a of Object.keys(o)) f(a, o[a])
}

// can't use interpolation because AWS OpenAPI variables use the same syntax
const makeUri = LambdaFunctionName => 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:' + LambdaFunctionName + '/invocations'

const traceFreshCopy = (f) => {
  const minimal = YAML.parse(file)
  eachKv(minimal.paths, (path, v) => {
    eachKv(v, (method, v) => {
      f(path, method, v)
    })
  })
  return minimal
}

exports.openapiJSON = async ({ resolveConfigurationProperty }) => {
  const service = await resolveConfigurationProperty(['service'])
  const stage = await resolveConfigurationProperty(['provider', 'stage']) || 'dev'
  const lambdaPrefix = `${service}-${stage}`

  return traceFreshCopy((path, method, v) => {
    const { "function" : ff } = v['x-serverless.com']
    delete v['x-serverless.com']
    v['x-amazon-apigateway-integration'] = {
      "payloadFormatVersion": "2.0",
      "type": "aws_proxy",
      "httpMethod": method.toUpperCase(),
      "uri": makeUri(`${lambdaPrefix}-${ff}`),
      "connectionType": "INTERNET"
    }
  })
}

exports.functions = async () => {
  const functions = {}

  traceFreshCopy((path, method, v) => {
    const vv = v['x-serverless.com']
    const ff = vv['function']
    delete vv['function']
    functions[ff] = vv
  })
  return functions
}
