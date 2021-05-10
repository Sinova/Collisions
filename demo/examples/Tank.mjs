import Collisions from '../../src/Collisions.mjs';

const width  = 800;
const height = 600;
const result = Collisions.createResult();

export default class Tank {
	constructor() {
		const collisions = new Collisions();

		this.element    = document.createElement('div');
		this.canvas     = document.createElement('canvas');
		this.context    = this.canvas.getContext('2d');
		this.collisions = collisions;
		this.bodies     = [];

		this.canvas.width  = width;
		this.canvas.height = height;
		this.player        = null;

		this.up    = false;
		this.down  = false;
		this.left  = false;
		this.right = false;

		this.element.innerHTML = `
			<div><b>W, S</b> - Accelerate/Decelerate</div>
			<div><b>A, D</b> - Turn</div>
			<div><label><input id="bvh" type="checkbox"> Show Bounding Volume Hierarchy</label></div>
		`;

		const updateKeys = (e) => {
			const keydown = e.type === 'keydown';
			const key     = e.key.toLowerCase();

			key === 'w' && (this.up = keydown);
			key === 's' && (this.down = keydown);
			key === 'a' && (this.left = keydown);
			key === 'd' && (this.right = keydown);
		};

		document.addEventListener('keydown', updateKeys);
		document.addEventListener('keyup', updateKeys);

		this.bvh_checkbox = this.element.querySelector('#bvh');
		this.element.appendChild(this.canvas);

		this.createPlayer(400, 300);
		this.createMap();

		const frame = () => {
			this.update();
			requestAnimationFrame(frame);
		};

		frame();
	}

	update() {
		this.handleInput();
		this.processGameLogic();
		this.handleCollisions();
		this.render();
	}

	handleInput() {
		this.up    && (this.player.velocity += 0.1);
		this.down  && (this.player.velocity -= 0.1);
		this.left  && (this.player.angle -= 0.04);
		this.right && (this.player.angle += 0.04);
	}

	processGameLogic() {
		const x = Math.cos(this.player.angle);
		const y = Math.sin(this.player.angle);

		if(this.player.velocity > 0) {
			this.player.velocity -= 0.05;

			if(this.player.velocity > 3) {
				this.player.velocity = 3;
			}
		}
		else if(this.player.velocity < 0) {
			this.player.velocity += 0.05;

			if(this.player.velocity < -2) {
				this.player.velocity = -2;
			}
		}

		if(!Math.round(this.player.velocity * 100)) {
			this.player.velocity = 0;
		}

		if(this.player.velocity) {
			this.player.x += x * this.player.velocity;
			this.player.y += y * this.player.velocity;
		}
	}

	handleCollisions() {
		this.collisions.update();

		const potentials = this.player.potentials();

		// Negate any collisions
		for(const body of potentials) {
			if(this.player.collides(body, result)) {
				this.player.x -= result.overlap * result.overlap_x;
				this.player.y -= result.overlap * result.overlap_y;

				this.player.velocity *= 0.9
			}
		}
	}

	render() {
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, 800, 600);

		this.context.strokeStyle = '#FFFFFF';
		this.context.beginPath();
		this.collisions.draw(this.context);
		this.context.stroke();

		if(this.bvh_checkbox.checked) {
			this.context.strokeStyle = '#00FF00';
			this.context.beginPath();
			this.collisions.drawBVH(this.context);
			this.context.stroke();
		}
	}

	createPlayer(x, y) {
		const size = 15;

		this.player = this.collisions.createPolygon(x, y, [
			[-20, -10],
			[20, -10],
			[20, 10],
			[-20, 10],
		], 0.2);

		this.player.velocity = 0;
	}

	createMap() {
		// World bounds
		this.collisions.createPolygon(0, 0, [[0, 0], [width, 0]]);
		this.collisions.createPolygon(0, 0, [[width, 0], [width, height]]);
		this.collisions.createPolygon(0, 0, [[width, height], [0, height]]);
		this.collisions.createPolygon(0, 0, [[0, height], [0, 0]]);

		// Factory
		this.collisions.createPolygon(100, 100, [[-50, -50], [50, -50], [50, 50], [-50, 50],], 0.4);
		this.collisions.createPolygon(190, 105, [[-20, -20], [20, -20], [20, 20], [-20, 20],], 0.4);
		this.collisions.createCircle(170, 140, 8);
		this.collisions.createCircle(185, 155, 8);
		this.collisions.createCircle(165, 165, 8);
		this.collisions.createCircle(145, 165, 8);

		// Airstrip
		this.collisions.createPolygon(230, 50, [[-150, -30], [150, -30], [150, 30], [-150, 30],], 0.4);

		// HQ
		this.collisions.createPolygon(100, 500, [[-40, -50], [40, -50], [50, 50], [-50, 50],], 0.2);
		this.collisions.createCircle(180, 490, 20);
		this.collisions.createCircle(175, 540, 20);

		// Barracks
		this.collisions.createPolygon(400, 500, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 1.7);
		this.collisions.createPolygon(350, 494, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 1.7);

		// Mountains
		this.collisions.createPolygon(750, 0, [[0, 0], [-20, 100]]);
		this.collisions.createPolygon(750, 0, [[-20, 100], [30, 250]]);
		this.collisions.createPolygon(750, 0, [[30, 250], [20, 300]]);
		this.collisions.createPolygon(750, 0, [[20, 300], [-50, 320]]);
		this.collisions.createPolygon(750, 0, [[-50, 320], [-90, 500]]);
		this.collisions.createPolygon(750, 0, [[-90, 500], [-200, 600]]);

		// Lake
		this.collisions.createPolygon(550, 100, [
			[-60, -20],
			[-20, -40],
			[30, -30],
			[60, 20],
			[40, 70],
			[10, 100],
			[-30, 110],
			[-80, 90],
			[-110, 50],
			[-100, 20],
		]);
	}
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}
