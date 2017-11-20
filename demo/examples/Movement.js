import Collisions from '../../src/Collisions.js';
import Utils      from '../classes/Utils.js';

const collision = {};

let circle = true;

export default class Movement {
	constructor() {
		this.element = document.createElement('div');
		this.canvas  = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.bodies  = [];

		this.canvas.width  = 400;
		this.canvas.height = 400;
		this.player        = null;

		this.element.innerHTML = `
			<div>
				<b>W, A, S, D</b> - Move
			</div>
			<div>
				<b>Q, E</b> - Rotate
			</div>
			<div>
				<b>R</b> - Change Shape
			</div>
		`;

		this.element.appendChild(this.canvas);
		this.createPlayer(200, 200);

		document.addEventListener('keyup', (e) => {
			if(e.key === 'r') {
				this.createPlayer(this.player.x, this.player.y);
			}
		});

		// this.bodies.push(
		// 	new Collisions.Circle(60, 60, Utils.random(20, 40)),
		// 	new Collisions.Polygon(200, 80, [[-30, -40], [60, -60], [20, 40], [-40, 50]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(350, 100, [[-30, -40], [60, -60], [50, 20], [20, 50], [-50, 50]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(40, 200, [[-20, -40], [30, -60], [70, 20], [20, 50], [-50, 30]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(100, 350, [[-20, -40], [30, -60], [70, 20], [20, 50], [-50, 30]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(300, 300, [[-20, -40], [60, 60]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(320, 320, [[0, 0]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(290, 280, [[0, 0]], Utils.random(0, 360) * Math.PI / 180),
		// 	new Collisions.Polygon(250, 250, [[0, 0]], Utils.random(0, 360) * Math.PI / 180),
		// );

		/////////////////////////
		const bvh = new Collisions.BVH();

		const shapes = [
			new Collisions.Circle(100, 100, 10),
			new Collisions.Circle(100, 200, 10),
			new Collisions.Circle(10, 10, 10),
			new Collisions.Circle(150, 130, 10),
			new Collisions.Circle(10, 210, 10),
			new Collisions.Circle(0, 0, 10),
			new Collisions.Circle(200, 100, 10),
			new Collisions.Circle(200, 300, 10),
		];

		for(const shape of shapes) {
			bvh.insert(shape);
		}

		// bvh.remove(shapes[0]);
		// bvh.remove(shapes[6]);
		// bvh.remove(shapes[7]);
		bvh.update();

		console.log(bvh._tree);

		const bar = (node) => {
			this.bodies.push(new Collisions.Polygon(0, 0, [
				[node._bvh_min_x, node._bvh_min_y],
				[node._bvh_max_x, node._bvh_min_y],
				[node._bvh_max_x, node._bvh_max_y],
				[node._bvh_min_x, node._bvh_max_y],
			]));

			if(node._bvh_left) {
				bar(node._bvh_left);
			}

			if(node._bvh_right) {
				bar(node._bvh_right);
			}

			if(!node._bvh_branch) {
				this.bodies.push(node);
			}
		};
		bar(bvh._tree);
		/////////////////////////
	}

	start() {
		if(this.frame) {
			return;
		}

		const self = this;

		this.frame = requestAnimationFrame(function frame() {
			self.update();
			self.frame = requestAnimationFrame(frame);
		});
	}

	stop() {
		clearAnimationFrame(this.frame);
	}

	update() {
		if(Utils.keyIsDown('a')) {
			this.player.x -= 2;
		}

		if(Utils.keyIsDown('d')) {
			this.player.x += 2;
		}

		if(Utils.keyIsDown('w')) {
			this.player.y -= 2;
		}

		if(Utils.keyIsDown('s')) {
			this.player.y += 2;
		}

		if(this.player._polygon && Utils.keyIsDown('q')) {
			this.player.angle -= 0.05;
		}

		if(this.player._polygon && Utils.keyIsDown('e')) {
			this.player.angle += 0.05;
		}

		for(const body of this.bodies) {
			if(body === this.player) {
				continue;
			}

			// Negate any collisions
			if(this.player.collides(body, collision)) {
				this.player.x -= collision.overlap * collision.overlap_x;
				this.player.y -= collision.overlap * collision.overlap_y;
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
		this.context.fillStyle = '#FFFFFF';
		this.context.strokeStyle = '#FFFFFF';

		Utils.render(this.context, this.bodies);

		// Render the character
		this.context.fillStyle = '#FC0';

		Utils.render(this.context, [this.player]);
	}

	createPlayer(x, y) {
		const size = 15;

		let body = null;

		if(!circle) {
			circle = true;
			body   = new Collisions.Circle(x, y, Utils.random(size-5, size + 5));
		}
		else {
			circle = false;

			body = new Collisions.Polygon(x, y, [
				[-Utils.random(size-5, size + 5), -Utils.random(size-5, size + 5)],
				[Utils.random(size-5, size + 5), -Utils.random(size-5, size + 5)],
				[Utils.random(size-5, size + 5), Utils.random(size-5, size + 5)],
				[-Utils.random(size-5, size + 5), Utils.random(size-5, size + 5)],
			], Utils.random(0, 360) * Math.PI / 180);
		}

		this.player = body;
	}
}
