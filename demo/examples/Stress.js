import Collisions from '../../src/Collisions.js';
import Utils      from '../classes/Utils.js';

const collision  = {};
const tmp_vector = [0, 0];

const count = 1000
const speed = 2;
const size  = 10;

export default class Stress {
	constructor() {
		this.element  = document.createElement('div');
		this.canvas   = document.createElement('canvas');
		this.context  = this.canvas.getContext('2d');
		this.bodies   = [];
		this.polygons = [];
		this.circles  = [];

		this.canvas.width  = 800;
		this.canvas.height = 600;
		this.context.font  = '16px Arial';

		this.element.appendChild(this.canvas);

		for(let i = 0; i < count; ++i) {
			this.createShape();
		}
	}

	start() {
		if(this.frame) {
			return;
		}

		const self = this;

		let time = performance.now();

		this.frame = requestAnimationFrame(function frame(current_time) {
			self.update(Math.round(10000 / (current_time - time)) / 10);
			self.frame = requestAnimationFrame(frame);

			time = current_time;
		});
	}

	update(fps) {
		for(let i = 0; i < this.bodies.length; ++i) {
			const body = this.bodies[i];

			body.x += body.direction[0] * speed;
			body.y += body.direction[1] * speed;

			for(let j = i + 1; j < this.bodies.length; ++j) {
				const body2 = this.bodies[j];

				if(body.collides(body2, collision)) {
					body.x -= collision.overlap * collision.overlap_x;
					body.y -= collision.overlap * collision.overlap_y;

					tmp_vector[0] = collision.overlap_y;
					tmp_vector[1] = -collision.overlap_x;

					Utils.reflect(body.direction, tmp_vector);
					Utils.reflect(body2.direction, tmp_vector);
				}
			}

			// Keep the shape in bounds
			if(body.x < 0) {
				body.x             = 0;
				body.direction[0] *= -1;
			}
			else if(body.x > 800) {
				body.x             = 800;
				body.direction[0] *= -1;
			}

			if(body.y < 0) {
				body.y             = 0;
				body.direction[1] *= -1;
			}
			else if(body.y > 600) {
				body.y             = 600;
				body.direction[1] *= -1;
			}
		}

		// Clear the canvas
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, 800, 600);

		// Render the bodies
		this.context.fillStyle = '#FFFFFF';

		Utils.render(this.context, this.bodies);

		this.context.fillStyle = '#FC0';
		this.context.fillText(fps, 10, 20);
	}

	createShape() {
		const x         = Utils.random(0, 800);
		const y         = Utils.random(0, 600);
		const direction = Utils.random(0, 360) * Math.PI / 180;

		let body = null;

		if(Utils.random(0, 2)) {
			body = new Collisions.Circle(x, y, Utils.random(3, size));

			this.circles.push(body);
		}
		else {
			body = new Collisions.Polygon(x, y, [
				[-Utils.random(3, size), -Utils.random(3, size)],
				[Utils.random(3, size), -Utils.random(3, size)],
				[Utils.random(3, size), Utils.random(3, size)],
				[-Utils.random(3, size), Utils.random(3, size)],
			], Utils.random(0, 360) * Math.PI / 180);

			this.polygons.push(body);
		}

		body.direction = [Math.cos(direction), Math.sin(direction)];
		this.bodies.push(body);
	}
}
