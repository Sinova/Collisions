import Collisions from '../../src/Collisions.js';

const collision = {};
const width     = 1024;
const height    = 768;
const count     = 1000
const speed     = 1;
const size      = 5;

let frame     = 0;
let fps_total = 0;

export default class Stress {
	constructor() {
		this.element    = document.createElement('div');
		this.canvas     = document.createElement('canvas');
		this.context    = this.canvas.getContext('2d');
		this.collisions = new Collisions();
		this.bodies     = [];
		this.polygons   = [];
		this.circles    = [];

		this.canvas.width  = width;
		this.canvas.height = height;
		this.context.font  = '24px Arial';

		for(let i = 0; i < count; ++i) {
			this.createShape();
		}

		this.element.innerHTML = `
			<div><b>Total:</b> ${count}</div>
			<div><b>Polygons:</b> ${this.polygons.length}</div>
			<div><b>Circles:</b> ${this.circles.length}</div>
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

			for(let i = 0; i < potentials.length; ++i) {
				const body2 = potentials[i];

				if(body.collides(body2, collision)) {
					body.x -= collision.overlap * collision.overlap_x;
					body.y -= collision.overlap * collision.overlap_y;

					let dot = body.direction_x * collision.overlap_y + body.direction_y * -collision.overlap_x;

					body.direction_x = 2 * dot * collision.overlap_y - body.direction_x;
					body.direction_y = 2 * dot * -collision.overlap_x - body.direction_y;

					dot = body2.direction_x * collision.overlap_y + body2.direction_y * -collision.overlap_x;

					body2.direction_x = 2 * dot * collision.overlap_y - body2.direction_x;
					body2.direction_y = 2 * dot * -collision.overlap_x - body2.direction_y;
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

		for(const body of this.bodies) {
			body.render(this.context);
		}

		this.context.stroke();

		// Render the collision system
		this.context.fillStyle   = '#AAAAAA';
		this.context.strokeStyle = '#AAAAAA';

		// this.collisions.render(this.context);

		// Render the FPS
		this.context.fillStyle = '#FC0';
		this.context.fillText(average_fps, 10, 30);
	}

	createShape() {
		const x         = random(0, width);
		const y         = random(0, height);
		const direction = random(0, 360) * Math.PI / 180;

		let body = null;

		if(random(0, 2)) {
			body = this.collisions.createCircle(x, y, random(3, size));

			this.circles.push(body);
		}
		else {
			body = this.collisions.createPolygon(x, y, [
				[-random(3, size), -random(3, size)],
				[random(3, size), -random(3, size)],
				[random(3, size), random(3, size)],
				[-random(3, size), random(3, size)],
			], random(0, 360) * Math.PI / 180);

			this.polygons.push(body);
		}

		body.direction_x = Math.cos(direction);
		body.direction_y = Math.sin(direction);

		this.bodies.push(body);
	}
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}
