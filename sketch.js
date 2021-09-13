let COUNTER = ""
const SPEED = 0.00915
const SIZE = 1 // increase in decimals
const AMOUNT = 100
const RANDOM1 = 0.5
const RANDOM2 = 5
const SPREAD = 3

let xoff = 0
let yoff = 1
let colorOff = 100
let spreadSeed = 50
let blobState = []

const tripleSize = SIZE * 3
const halfSize = SIZE / 2
const oneDot5Size = SIZE * 1.5
const halfAmount = AMOUNT / 2
let longEdge
let shortEdge
let spreadX
let spreadY
const alpha = (80 / AMOUNT) * 10

let mouseOver = false

function setup() {
	createCanvas(windowWidth, windowHeight)
	longEdge = windowWidth > windowHeight ? windowWidth : windowHeight
	shortEdge = windowHeight > windowWidth ? windowHeight : windowWidth
	spreadX = (windowWidth / 100) * SPREAD
	spreadY = (windowHeight / 100) * SPREAD
}

function draw() {
	if (COUNTER !== "" && COUNTER === 2) noLoop()
	else COUNTER += 1

	background(0)
	let x = map(noise(xoff), 0, 1, 0, width)
	let y = map(noise(yoff), 0, 1, 0, height)

	blobState = createBlobs(blobState, AMOUNT, x, y)
	// console.log(blobState)

	for (let i = blobState.length - 1; i >= 0; i--) {
		const alphaStroke = map(i, AMOUNT, 0, 20, 100)
		fill(blobState[i].color, map(i, 0, AMOUNT, 0, alpha))
		strokeWeight(map(i, blobState.length, 0, 1, 9))
		stroke(255, alphaStroke)
		ellipse(
			blobState[i].x,
			blobState[i].y,
			blobState[i].sizeX,
			blobState[i].sizeY
		)
	}
	// blobState.forEach((e, i) => {
	// 	const alpha = map(i, blobState.length, 0, 20, 90)
	// 	fill(e.color, alpha * 0.1)
	// 	strokeWeight(map(i, blobState.length, 0, 1, 14))
	// 	stroke(map(e.color, 0, 255, 255, 0), alpha)
	// 	ellipse(e.x, e.y, e.size)
	// })

	xoff += SPEED
	yoff += SPEED
	spreadSeed += 0.1
	colorOff += 0.0015
}

//*'''''''''''############

function createBlobs(state, amount, xSeed, ySeed) {
	let newState = []
	state.forEach((e, i) => {
		newState[(i += 1)] = e
	})
	while (newState.length > amount) newState.pop()

	const colorOffNoise = noise(colorOff)

	for (let i = 0; i < amount; i++) {
		if (i === 0) {
			const randomValue = map(colorOffNoise, 0, 1, RANDOM1, RANDOM2)
			const color = calcColor(i, randomValue)
			const [sizeX, sizeY] = calcSize(i, randomValue)

			newState[0] = {
				x: xSeed,
				y: ySeed,
				color: 255,
				sizeX,
				sizeY,
				color,
				randomValue,
			}
		} else if (state[i - 1] !== undefined) {
			// * color
			const color = calcColor(i, newState[i].randomValue)
			// * size
			const [sizeX, sizeY] = calcSize(i, newState[i].randomValue)
			// * Position
			const [x, y] = calcPosition(i, newState[i].randomValue)
			//* Push State
			newState[i] = {
				...newState[i],
				x: x,
				y: y,
				sizeX,
				sizeY,
				color,
			}
		} else {
			return newState
		}
	}

	// ###################
	// * Functions
	// ###################

	function calcColor(index, randomVal = 0) {
		if (index === 0) {
			return map(noise(colorOff + randomVal), 0, 1, 0, 50)
		}
		return min(
			(map(noise(colorOff + newState[index - 1].randomValue), 0, 1, 0, 70) +
				newState[index - 1].color) /
				2 +
				map(index, 0, amount, 0, 30),
			120
		)
	}

	function calcPosition(index, randomValue) {
		if (index === 0) {
			const randomFactor = 1
			const spreadFactor = 1 / (index < halfAmount ? index : halfAmount)

			const a = newState[index]
			// console.log("a:", a)
			const b = newState[index - 1]
			// console.log("b: ", b)
			const x = (b.x - a.x) * randomFactor * spreadFactor + a.x
			const y = (b.y - a.y) * randomFactor * spreadFactor + a.y
			return [x, y]
		} else {
			const relativeProgress = index / amount
			const uniqueColorOff = colorOff + randomValue

			const randomFactor = map(noise(uniqueColorOff), 0, 1, 0.005, 1)
			const randomMovementX =
				map(noise(uniqueColorOff), 0, 1, -spreadX, spreadX) *
				sin(map(noise(uniqueColorOff), 0, 1, -360, 360)) *
				relativeProgress
			const randomMovementY =
				map(noise(uniqueColorOff + RANDOM2), 0, 1, -spreadY, spreadY) *
				cos(map(noise(uniqueColorOff), 0, 1, -360, 360)) *
				relativeProgress

			const spreadFactor = 1 / (index < halfAmount ? index : halfAmount)
			const a = newState[index]
			const b = newState[index - 1]

			const x =
				(b.x - a.x) * randomFactor * spreadFactor + a.x + randomMovementX

			const y =
				(b.y - a.y) * randomFactor * spreadFactor + a.y + randomMovementY
			return [x, y]
		}
	}

	function calcSize(index, randomValue = 0) {
		const totalLengthX =
			longEdge *
			map(noise(colorOff + randomValue + 100), 0, 1, halfSize, tripleSize)
		const totalLengthY =
			longEdge * map(noise(colorOff + randomValue), 0, 1, halfSize, tripleSize)
		const splittedSizeX = totalLengthX / amount
		const splittedSizeY = totalLengthY / amount
		const sizeX = Math.max(totalLengthX - index * splittedSizeX, 2)
		const sizeY = Math.max(totalLengthY - index * splittedSizeY, 2)

		return [sizeX, sizeY]
	}

	return newState
}

window.addEventListener("DOMContentLoaded", () => {
	console.log("added")
	document.body.addEventListener("mouseover", () => {
		mouseOver = true
	})
	document.body.addEventListener("mouseout", () => {
		mouseOver = false
	})
})
