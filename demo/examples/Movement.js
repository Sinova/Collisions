import Collisions from '../../src/Collisions.js';

const result = Collisions.createResult();

let circle = true;

export default class Movement {
	constructor() {
		const collisions = new Collisions();

		this.element    = document.createElement('div');
		this.canvas     = document.createElement('canvas');
		this.context    = this.canvas.getContext('2d');
		this.collisions = collisions;
		this.bodies     = [];

		this.canvas.width  = 400;
		this.canvas.height = 400;
		this.player        = null;

		this.up               = false;
		this.down             = false;
		this.left             = false;
		this.right            = false;
		this.clockwise        = false;
		this.counterclockwise = false;

		this.element.innerHTML = `
			<div><b>W, A, S, D</b> - Move</div>
			<div><b>Q, E</b> - Rotate</div>
			<div><b>R</b> - Change Shape</div>
		`;

		this.element.appendChild(this.canvas);
		this.createPlayer(200, 200);

		const updateKeys = (e) => {
			const down = e.type === 'keydown';

			e.key === 'w'          && (this.up = down);
			e.key === 's'          && (this.down = down);
			e.key === 'a'          && (this.left = down);
			e.key === 'd'          && (this.right = down);
			e.key === 'e'          && (this.clockwise = down);
			e.key === 'q'          && (this.counterclockwise = down);
			e.key === 'r' && !down && (this.createPlayer(this.player.x, this.player.y));
		};

		document.addEventListener('keydown', updateKeys);
		document.addEventListener('keyup', updateKeys);

		this.bodies.push(
			this.collisions.createCircle(60, 60, random(20, 40)),
			this.collisions.createPolygon(200, 80, [[-30, -40], [60, -60], [20, 40], [-40, 50]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(350, 100, [[-30, -40], [60, -60], [50, 20], [20, 50], [-50, 50]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(40, 200, [[-20, -40], [30, -60], [70, 20], [20, 50], [-50, 30]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(100, 350, [[-20, -40], [30, -60], [70, 20], [20, 50], [-50, 30]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(300, 300, [[-20, -40], [60, 60]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(320, 320, [[0, 0]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(290, 280, [[0, 0]], random(0, 360) * Math.PI / 180),
			this.collisions.createPolygon(250, 250, [[0, 0]], random(0, 360) * Math.PI / 180),
		);

		const self = this;

		this.frame = requestAnimationFrame(function frame() {
			self.update();
			self.frame = requestAnimationFrame(frame);
		});

		window.foo = this.player;
	}

	update() {
		this.collisions.update();

		const polygon = this.player._polygon;

		this.up                          && (this.player.y -= 2);
		this.down                        && (this.player.y += 2);
		this.left                        && (this.player.x -= 2);
		this.right                       && (this.player.x += 2);
		this.clockwise        && polygon && (this.player.angle += 0.05);
		this.counterclockwise && polygon && (this.player.angle -= 0.05);

		const potentials = this.player.potentials();
		for(const body of this.bodies) {
			if(body === this.player) {
				continue;
			}

			// Negate any collisions
			if(this.player.collides(body, result)) {
				this.player.x -= result.overlap * result.overlap_x;
				this.player.y -= result.overlap * result.overlap_y;
			}

			// Keep the player in bounds
			if(this.player.x < 0) {
				this.player.x = 0;
			}
			else if(this.player.x > 400) {
				this.player.x = 400;
			}

			if(this.player.y < 0) {
				this.player.y = 0;
			}
			else if(this.player.y > 400) {
				this.player.y = 400;
			}
		}

		// Clear the canvas
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, 800, 600);

		// Render the bodies
		this.context.fillStyle   = '#FFFFFF';
		this.context.strokeStyle = '#FFFFFF';

		this.context.beginPath();
		this.collisions.renderBodies(this.context);
		this.collisions.renderBVH(this.context);
		this.context.stroke();
	}

	createPlayer(x, y) {
		const size = 15;

		let body;

		if(this.player) {
			this.collisions.remove(this.player);
		}

		if(!circle) {
			circle = true;
			body   = this.collisions.createCircle(x, y, random(size-5, size + 5));
		}
		else {
			circle = false;

			body = this.collisions.createPolygon(x, y, [
				[-random(size-5, size + 5), -random(size-5, size + 5)],
				[random(size-5, size + 5), -random(size-5, size + 5)],
				[random(size-5, size + 5), random(size-5, size + 5)],
				[-random(size-5, size + 5), random(size-5, size + 5)],
			], random(0, 360) * Math.PI / 180);
		}

		this.player = body;
	}
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}
