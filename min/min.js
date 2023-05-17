// Импорт необходимых модулей
const fs = require('fs')
const YAML = require('yamljs')
const assert = require('assert')

// Определение имени YAML-файла
const fileName = 'schema/minimal.yml'

// Чтение содержимого YAML-файла
const file = fs.readFileSync(fileName, 'utf8')

// Функция для обхода каждого ключа-значения объекта
const eachKv = (o, f) => {
  for (let a of Object.keys(o)) f(a, o[a])
}

// Функция для создания URI для функции Lambda
const makeUri = LambdaFunctionName => 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:' + LambdaFunctionName + '/invocations'
// Возможно строчка выше все ломает(18)

// Функция для обработки свежей копии YAML-файла
const traceFreshCopy = (f) => {
  const minimal = YAML.parse(file)
  eachKv(minimal.paths, (path, v) => {
    eachKv(v, (method, v) => {
      f(path, method, v)
    })
  })
  return minimal
}

// Экспорт функции для создания конфигурации OpenAPI JSON
exports.openapiJSON = async ({ resolveConfigurationProperty }) => {
  const service = "aws-node-project"//await resolveConfigurationProperty(['service'])
  const stage = "dev"//await resolveConfigurationProperty(['provider', 'stage']) || 'dev'
  const lambdaPrefix = `${service}-${stage}`
  const minimal = traceFreshCopy((path, method, v) => {
    const { "function": ff } = v['x-serverless.com']
    delete v['x-serverless.com']
    v['x-amazon-apigateway-integration'] = {
      "payloadFormatVersion": "2.0",
      "type": "aws_proxy",
      "httpMethod": method.toUpperCase(),
      "uri": makeUri(`${lambdaPrefix}-${ff}`),
      "connectionType": "INTERNET"
    }
  })
  // fs.writeFile('minimal/minimal.json', JSON.stringify(minimal), (err) => {
  //   if (err) throw err;
  //   console.log('Result is saved');
  // });
  return minimal
}

// Экспорт функции для создания конфигурации функций AWS Lambda
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