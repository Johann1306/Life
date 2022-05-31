const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 500
canvas.height = 500

c.fillRect(0, 0, canvas.width, canvas.height)

// Vitesse de rafraichissement
var countFrame = 0
const countFrameMax = 5

class Human {
	constructor({
	}) {
		this.position = {
			x: Math.round(Math.random() * 49) * 10,
			y: Math.round(Math.random() * 49) * 10
		},
			this.color = 'rgb('
			+ Math.random() * 255 + ','
			+ Math.random() * 255 + ','
			+ 255 + ')'
	}

	draw() {
		// console.log(this.position.x + ' : ' + this.position.y)
		c.fillStyle = this.color
		c.fillRect(this.position.x, this.position.y, 10, 10)
	}

	animateFrames() {

		const rand = Math.random()
		if (rand < 0.25) {
			if (this.position.x < 490)
				this.position.x += 10
		} else if (rand < 0.5) {
			if (this.position.x > 0)
				this.position.x -= 10
		} else if (rand < 0.75) {
			if (this.position.y < 490)
				this.position.y += 10
		} else if (rand < 1) {
			if (this.position.y > 0)
				this.position.y -= 10
		}
	}

	update() {
		this.draw()
		this.animateFrames()
	}
}

const humans = []
for (let i = 0; i < 500; i++) {
	humans[i] = new Human({})
}

function animate() {
	window.requestAnimationFrame(animate)

	if (countFrame === countFrameMax) {
		c.fillStyle = 'black'
		c.fillRect(0, 0, canvas.width, canvas.height);

		humans.forEach(human => {
			human.update()
		});
		countFrame = 0
	} else {
		countFrame++
	}

}

animate()