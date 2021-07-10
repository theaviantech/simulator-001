const ee = require('events')
const { startNodeId, generateChart, nodeEvents } = require('./main')
// console.log(mainState.node0)

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test() {
	for (let i = 0; i < 5; i++) {
		console.log("ROUND: ==================== ", i);
		const mainState = generateChart()
		// const state = mainState.state
		nodeEvents.emit(`start${mainState.node0}`, { fromId: null, round: i })
		await delay(400);
	}
}

test();