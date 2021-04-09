type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEventV2, 'body'> & { body: S }

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from "aws-lambda"

import { foo } from './bar.js'

export const hello : Handler = async (_event: ValidatedAPIGatewayProxyEvent<{ xx: number }>): Promise<APIGatewayProxyResultV2<never>> => {
  return { statusCode: 200, body: JSON.stringify({ xx: foo }) }
}

