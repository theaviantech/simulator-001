const EventEmitter = require('events')
const { delay } = require('./utils')
const state = {}
const nodeEvents = new EventEmitter()

function insertNode({ name, type, duration, speedup }) {
	const nodeId = Math.random()
	state[nodeId] = { name, type, duration, id: nodeId, to: [], from: [] }
	nodeEvents.on(`start${nodeId}`, async () => {
		console.log("start", state[nodeId]['name'])
		const timeDelay = (duration * 60 * 1000) / speedup
		console.log(timeDelay);
		await delay(timeDelay)
		const toNodes = state[nodeId]['to']
		if (toNodes.length > 0) {
			if (toNodes.length > 1) {
				// console.log("INNER", state[nodeId]['to']);
				const decisionNodeId = gatewayChance(state[nodeId]['to'])
				// console.log(decisionNodeId, "<<<<<<<");
				nodeEvents.emit(`start${decisionNodeId}`)
			} else {
				// console.log(state[nodeId]['to'], "!!!!");
				nodeEvents.emit(`start${state[nodeId]['to'][0]['id']}`)
			}
		}
	})
	return nodeId
}

function linkNode({ fromId, toId, probability }) {
	nodeEvents.on(`completed${fromId}`, () => {
		if (chance(probability)) {
			console.log("Node completed: ", state[fromId]['name'])
			nodeEvents.emit(`start${toId}`)
		}
	})
	state[fromId] = {
		...state[fromId],
		to: [
			{
				id: toId,
				probability
			}, ...state[fromId]['to']]
	}
	state[toId] = {
		...state[toId],
		from: [
			{
				id: fromId,
				probability
			}, ...state[toId]['from']]
	}
}

function gatewayChance(toNodes) {
	if (chance(toNodes[0]['probability'])) {
		// console.log("chanceA ======================")
		return toNodes[0]['id']
	} else {
		// console.log("chanceB, --------------------")
		return toNodes[1]['id']
	}
}

function chance(probabilityA) {
	var chanceResult = Math.floor(100 * Math.random()) + 1
	return chanceResult < (probabilityA * 100)
}

function main() {
	const speedup = 8000
	const node0 = insertNode({ name: "O", type: "start", duration: 60, speedup })
	const nodeA = insertNode({ name: "A", type: "activity", duration: 60, speedup })
	const nodeB = insertNode({ name: "B", type: "activity", duration: 60, speedup })
	const nodeC = insertNode({ name: "gatewayC", type: "gateway", duration: 60, speedup })
	const nodeD = insertNode({ name: "D", type: "activity", duration: 60, speedup })
	const nodeE = insertNode({ name: "E", type: "activity", duration: 60, speedup })
	const nodeF = insertNode({ name: "F", type: "activity", duration: 60, speedup })
	linkNode({ fromId: node0, toId: nodeA, probability: 1 })
	linkNode({ fromId: nodeA, toId: nodeB, probability: 1 })
	linkNode({ fromId: nodeB, toId: nodeC, probability: 1 })
	linkNode({ fromId: nodeC, toId: nodeD, probability: 0.5 })
	linkNode({ fromId: nodeC, toId: nodeE, probability: 0.2 })
	linkNode({ fromId: nodeE, toId: nodeF, probability: 0.5 })
	console.log(state)


	return { state, node0 }
}

module.exports = {
	main,
	nodeEvents,
}