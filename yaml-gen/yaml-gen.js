const fs = require('fs')

const [,, fileName, region, account, lambdaPrefix] = process.argv

const minimal = JSON.parse(fs.readFileSync(fileName, 'utf8'))

const eachKvo = (o, f) => {
  for (let a of Object.keys(o)) f(a, o[a], o)
}


eachKvo(minimal.paths, (path, v, o) => {
  eachKvo(v, (method, v, o) => {
    const { handler, "function" : ff } = v['x-serverless.com']
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

console.log(JSON.stringify(minimal))
