const EventEmitter = require('events')
const { delay } = require('./utils')
const state = {}
const nodeEvents = new EventEmitter()
let endCounter = 0
function insertNode({ name, type, duration, speedup }) {
	const nodeId = Math.random()
	state[nodeId] = { name, type, duration, id: nodeId, to: [], from: [] }
	nodeEvents.on(`start${nodeId}`, async ({ fromId }) => {
		if (state[nodeId]['type'] === 'gateway_parallel') {
			const fromNode = state[nodeId]['from'].map(from => from.id === fromId ?
				{ ...from, completed: true } : from)
			state[nodeId] = {
				...state[nodeId],
				from: fromNode
			}
			const fromNodeNotCompleted = state[nodeId]['from'].filter(from => from.completed === false)
			if (fromNodeNotCompleted.length === 0) {
				state[nodeId]['to'].forEach(toNode => {
					nodeEvents.emit(`start${toNode['id']}`, { fromId: nodeId })
				})
			} else {
				console.log("Waiting for another node");
			}
		} else if (state[nodeId]['type'] === 'gateway_exclusive') {
			if (state[nodeId]['to'].length === 2) {

				const decisionNodeId = gatewayChance(state[nodeId]['to'])
				// console.log(decisionNodeId, "<<<<<<<");
				nodeEvents.emit(`start${decisionNodeId}`, { fromId: nodeId })
			} else {
				console.error("node length for gateway exclusive should be 2");
			}

		} else if (state[nodeId]['type'] === 'end') {
			console.log("END ==================", endCounter++);

		} else {
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
					nodeEvents.emit(`start${decisionNodeId}`, { fromId: nodeId })
				} else {
					// console.log(state[nodeId]['to'], "!!!!");
					nodeEvents.emit(`start${state[nodeId]['to'][0]['id']}`, { fromId: nodeId })
				}
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
				probability,
				comleted: false
			}, ...state[fromId]['to']]
	}
	state[toId] = {
		...state[toId],
		from: [
			{
				id: fromId,
				probability,
				completed: false
			}, ...state[toId]['from']]
	}
}

function gatewayChance(toNodes) {
	if (chance(toNodes[0]['probability'])) {
		console.log("chanceA ======================")
		return toNodes[0]['id']
	} else {
		console.log("chanceB, --------------------")
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
	const nodeC = insertNode({ name: "gatewayC", type: "gateway_parallel", duration: 60, speedup })
	const nodeD = insertNode({ name: "D", type: "activity", duration: 60, speedup })
	const nodeE = insertNode({ name: "E", type: "activity", duration: 60, speedup })
	const nodeF = insertNode({ name: "F", type: "activity", duration: 60, speedup })
	const nodeG = insertNode({ name: "G", type: "gateway_parallel", duration: 0, speedup })
	const nodeH = insertNode({ name: "H", type: "activity", duration: 60, speedup })
	const nodeZ = insertNode({ name: "Z", type: "activity", duration: 60, speedup })
	const nodeZ1 = insertNode({ name: "Z1", type: "gateway_exclusive", duration: 60, speedup })
	const nodeZ2 = insertNode({ name: "Z2", type: "activity", duration: 60, speedup })
	const nodeZ00 = insertNode({ name: "Z00", type: "end", duration: 60, speedup })
	linkNode({ fromId: node0, toId: nodeA, probability: 1 })
	linkNode({ fromId: nodeA, toId: nodeB, probability: 1 })
	linkNode({ fromId: nodeB, toId: nodeC, probability: 1 })
	linkNode({ fromId: nodeC, toId: nodeD, probability: 1 })
	linkNode({ fromId: nodeC, toId: nodeE, probability: 1 })
	linkNode({ fromId: nodeC, toId: nodeZ, probability: 1 })
	linkNode({ fromId: nodeZ, toId: nodeZ1, probability: 1 })
	linkNode({ fromId: nodeZ1, toId: nodeZ2, probability: 0.3 })
	linkNode({ fromId: nodeZ1, toId: nodeA, probability: 0.7 })
	linkNode({ fromId: nodeZ2, toId: nodeG, probability: 1 })
	linkNode({ fromId: nodeE, toId: nodeF, probability: 0.5 })
	linkNode({ fromId: nodeF, toId: nodeG, probability: 1 })
	linkNode({ fromId: nodeD, toId: nodeG, probability: 1 })
	linkNode({ fromId: nodeG, toId: nodeH, probability: 1 })
	linkNode({ fromId: nodeH, toId: nodeZ00, probability: 1 })

	console.log(state)


	return { state, node0 }
}

module.exports = {
	main,
	nodeEvents,
}