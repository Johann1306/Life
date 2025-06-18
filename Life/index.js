const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1900
canvas.height = 900

c.fillRect(0, 0, canvas.width, canvas.height)

// Vitesse de rafraichissement
var countFrame = 0
const countFrameMax = 1
const resolution = 10

// test 

var grille = new Array(canvas.width / resolution).fill(0).map(() => new Array(canvas.height / resolution).fill(0));
var grilleNext = new Array(canvas.width / resolution).fill(0).map(() => new Array(canvas.height / resolution).fill(0));

initGrille()
drawGrille(grille)
animate()

// console.table(grille)
// console.table(grilleNext)

function initGrille() {
	for (let i = 0; i < canvas.width / resolution; i++) {
		for (let j = 0; j < canvas.height / resolution; j++) {
			grille[i][j] = Math.round(Math.random())
			grilleNext[i][j] = grille[i][j]
		}
	}
}

function drawGrille(grid) {
	for (let i = 0; i < canvas.width / resolution; i++) {
		for (let j = 0; j < canvas.height / resolution; j++) {
			if (grid[i][j] === 1) {
				c.fillStyle = 'green'
				c.fillRect(i * resolution, j * resolution, resolution - 1, resolution - 1)
			} else {
				c.fillStyle = 'black'
				c.fillRect(i * resolution, j * resolution, resolution - 1, resolution - 1)
			}
		}
	}
}

function animate() {
	window.requestAnimationFrame(animate)
	if (countFrame === countFrameMax) {

		c.fillStyle = 'black'
		c.fillRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < canvas.width / resolution; i++) {
			for (let j = 0; j < canvas.height / resolution; j++) {
				// console.log(grille)
				var voisins = compteVoisins(i, j)
				// Vivant
				if (grille[i][j] === 1) {
					// Souspopulation / Surpopulation
					if (voisins < 2 || voisins > 3) {
						grilleNext[i][j] = 0 // = mort
						// Survis
					} else {
						grilleNext[i][j] = 1 // = vie
					}
					// Mort
				} else {
					// Naissance
					if (voisins === 3) {
						grilleNext[i][j] = 1 // = vie
						// Reste mort
					} else {
						grilleNext[i][j] = 0 // = mort
					}
				}
			}
		}

		drawGrille(grilleNext)

		for (let i = 0; i < canvas.width / resolution; i++) {
			for (let j = 0; j < canvas.height / resolution; j++) {
				grille[i][j] = grilleNext[i][j]
			}
		}

		countFrame = 0
	} else {
		countFrame++
	}

}

function compteVoisins(x, y) {
	var count = 0

	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			var col = x + i
			var row = y + j

			if (col === -1) {
				col = (canvas.width / resolution) - 1
			} else if (col === (canvas.width / resolution)) {
				col = 0
			}

			if (row === -1) {
				row = (canvas.height / resolution) - 1
			} else if (row === (canvas.height / resolution)) {
				row = 0
			}

			if (grille[col][row] === 1) {
				count++
			}
		}
	}

	if (grille[x][y] === 1) {
		count--
	}

	return count
}


