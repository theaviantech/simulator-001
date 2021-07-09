const ee = require('events')
const { startNodeId, main, nodeEvents } = require('./main')
const mainState = main()
const state = mainState.state
// console.log(mainState.node0)

function delay(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

async function test() {
	for (let i = 0; i < 2; i++) {
		console.log("ROUND: ==================== ", i);
		nodeEvents.emit(`start${mainState.node0}`, {fromId: null})
		await delay(400);
	}
}

test();
// for (let x = 0; x < 100; x++) {
// 	setTimeout(() => {
// 		console.log("x: ", x)
// 	}, 1000)
// }
