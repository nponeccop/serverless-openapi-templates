import { foo } from './bar.js'

export const hello = () => { return {
	statusCode: 200,
	body: JSON.stringify({foo})
}}
