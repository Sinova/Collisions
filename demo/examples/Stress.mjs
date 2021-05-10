import Collisions from '../../src/Collisions.mjs';

const result = Collisions.createResult();
const width  = 800;
const height = 600;
const count  = 500
const speed  = 1;
const size   = 5;

let frame     = 0;
let fps_total = 0;

export default class Stress {
	constructor() {
		this.element    = document.createElement('div');
		this.canvas     = document.createElement('canvas');
		this.context    = this.canvas.getContext('2d');
		this.collisions = new Collisions();
		this.bodies     = [];
		this.polygons   = 0;
		this.circles    = 0;

		this.canvas.width  = width;
		this.canvas.height = height;
		this.context.font  = '24px Arial';

		// World bounds
		this.collisions.createPolygon(0, 0, [[0, 0], [width, 0]]);
		this.collisions.createPolygon(0, 0, [[width, 0], [width, height]]);
		this.collisions.createPolygon(0, 0, [[width, height], [0, height]]);
		this.collisions.createPolygon(0, 0, [[0, height], [0, 0]]);

		for(let i = 0; i < count; ++i) {
			this.createShape(!random(0, 49));
		}

		this.element.innerHTML = `
			<div><b>Total:</b> ${count}</div>
			<div><b>Polygons:</b> ${this.polygons}</div>
			<div><b>Circles:</b> ${this.circles}</div>
			<div><label><input id="bvh" type="checkbox"> Show Bounding Volume Hierarchy</label></div>
		`;

		this.bvh_checkbox = this.element.querySelector('#bvh');
		this.element.appendChild(this.canvas);

		const self = this;

		let time = performance.now();

		this.frame = requestAnimationFrame(function frame() {
			const current_time = performance.now();

			self.update(1000 / (current_time - time));
			self.frame = requestAnimationFrame(frame);

			time = current_time;
		});
	}

	update(fps) {
		this.collisions.update();

		++frame;
		fps_total += fps;

		const average_fps = Math.round(fps_total / frame);

		if(frame > 100) {
			frame     = 1;
			fps_total = average_fps;
		}

		for(let i = 0; i < this.bodies.length; ++i) {
			const body = this.bodies[i];

			body.x += body.direction_x * speed;
			body.y += body.direction_y * speed;

			const potentials = body.potentials();

			for(const body2 of potentials) {
				if(body.collides(body2, result)) {
					body.x -= result.overlap * result.overlap_x;
					body.y -= result.overlap * result.overlap_y;

					let dot = body.direction_x * result.overlap_y + body.direction_y * -result.overlap_x;

					body.direction_x = 2 * dot * result.overlap_y - body.direction_x;
					body.direction_y = 2 * dot * -result.overlap_x - body.direction_y;

					dot = body2.direction_x * result.overlap_y + body2.direction_y * -result.overlap_x;

					body2.direction_x = 2 * dot * result.overlap_y - body2.direction_x;
					body2.direction_y = 2 * dot * -result.overlap_x - body2.direction_y;
				}
			}
		}

		// Clear the canvas
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, width, height);

		// Render the bodies
		this.context.strokeStyle = '#FFFFFF';
		this.context.beginPath();
		this.collisions.draw(this.context);
		this.context.stroke();

		// Render the BVH
		if(this.bvh_checkbox.checked) {
			this.context.strokeStyle = '#00FF00';
			this.context.beginPath();
			this.collisions.drawBVH(this.context);
			this.context.stroke();
		}

		// Render the FPS
		this.context.fillStyle = '#FFCC00';
		this.context.fillText(average_fps, 10, 30);
	}

	createShape(large) {
		const min_size  = size * 0.75 * (large ? 3 : 1);
		const max_size  = size * 1.25 * (large ? 5 : 1);
		const x         = random(0, width);
		const y         = random(0, height);
		const direction = random(0, 360) * Math.PI / 180;

		let body;

		if(random(0, 2)) {
			body = this.collisions.createCircle(x, y, random(min_size, max_size));

			++this.circles;
		}
		else {
			body = this.collisions.createPolygon(x, y, [
				[-random(min_size, max_size), -random(min_size, max_size)],
				[random(min_size, max_size), -random(min_size, max_size)],
				[random(min_size, max_size), random(min_size, max_size)],
				[-random(min_size, max_size), random(3, size)],
			], random(0, 360) * Math.PI / 180);

			++this.polygons;
		}

		body.direction_x = Math.cos(direction);
		body.direction_y = Math.sin(direction);

		this.bodies.push(body);
	}
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}
