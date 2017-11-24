import Collisions from '../../src/Collisions.js';

const result = Collisions.createResult();
const width  = 1024;
const height = 768;
const count  = 1000
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

		for(let i = 0; i < count; ++i) {
			this.createShape(!random(0, 49));
		}

		this.element.innerHTML = `
			<div><b>Total:</b> ${count}</div>
			<div><b>Polygons:</b> ${this.polygons}</div>
			<div><b>Circles:</b> ${this.circles}</div>
		`;

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

			// Keep the shape in bounds
			if(body.x < 0) {
				body.x            = 0;
				body.direction_x *= -1;
			}
			else if(body.x > width) {
				body.x             = width;
				body.direction_x *= -1;
			}

			if(body.y < 0) {
				body.y            = 0;
				body.direction_y *= -1;
			}
			else if(body.y > height) {
				body.y            = height;
				body.direction_y *= -1;
			}
		}

		// Clear the canvas
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, width, height);

		// Render the bodies
		this.context.fillStyle   = '#FFFFFF';
		this.context.strokeStyle = '#FFFFFF';

		this.context.beginPath();
		this.collisions.renderBodies(this.context);
		this.context.stroke();

		// Render the FPS
		this.context.fillStyle = '#FC0';
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
