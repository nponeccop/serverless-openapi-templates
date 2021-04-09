const handler = import('./esm/handler.js')

let mm

handler.then(x => {
	mm = x
}).catch(e => console.log(e))

exports.hello = async () => {
	const m = mm || await handler
	return m.hello()	
}

