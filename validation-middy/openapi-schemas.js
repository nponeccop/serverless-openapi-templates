const $RefParser = require('@apidevtools/json-schema-ref-parser')
const YAML = require('yamljs')
const Ajv = require('ajv')
const fs = require('fs')

const ajv = new Ajv({ code: { source: true } }) // this option is required to generate standalone code
const standaloneCode = require('ajv/dist/standalone')

const fileName = 'validation.yml'

const file = fs.readFileSync(fileName, 'utf8')
const awsScheme = fs.readFileSync('aws-lambda-scheme.yml', 'utf8')

const eachKv = (o, f) => {
  for (const a of Object.keys(o)) f(a, o[a])
}

const minimal = YAML.parse(file)
const lambda = YAML.parse(awsScheme)

const traceFreshCopy = (minimal, f) => {
  eachKv(minimal.paths, (path, v) => {
    eachKv(v, (method, v) => {
      f(path, method, v)
    })
  })
  return minimal
}

const main = async () => {
  const r = await $RefParser.dereference(minimal)

  traceFreshCopy(r, (path, method, v) => {
    //  const ff = vv['function']
    const schema = v.requestBody.content['application/json'].schema

    lambda.properties.body = schema

    const validate = ajv.compile(lambda)
    const moduleCode = standaloneCode.default(ajv, validate)
    const operationId = v.operationId
    fs.writeFileSync(`schema/${operationId}.js`, moduleCode)
    console.log('Done')
  })
}

main().then(() => 1).catch(x => console.log(x))
