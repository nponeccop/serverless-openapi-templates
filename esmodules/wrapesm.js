const handler = import('./esm/handler.js')

exports.hello = async () => {
	const m = await handler
	return m.hello()	
}

