import Collisions from '../../src/Collisions.js';
import Utils      from '../classes/Utils.js';

const collision = {};
const count     = 200
const speed     = 2;
const size      = 20;

let frame     = 0;
let fps_total = 0;

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
		this.context.font  = '24px Arial';

		for(let i = 0; i < count; ++i) {
			this.createShape();
		}

		this.element.innerHTML = `
			<div>
				<b>Total:</b> ${count}
			</div>
			<div>
				<b>Polygons</b> - ${this.polygons.length}
			</div>
			<div>
				<b>Circles</b> - ${this.circles.length}
			</div>
		`;

		this.element.appendChild(this.canvas);
	}

	start() {
		if(this.frame) {
			return;
		}

		const self = this;

		let time = 0;

		this.frame = requestAnimationFrame(function frame(current_time) {
			self.update(1000 / (current_time - time));
			self.frame = requestAnimationFrame(frame);

			time = current_time;
		});
	}

	update(fps) {
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

			for(let j = i + 1; j < this.bodies.length; ++j) {
				const body2 = this.bodies[j];

				if(Collisions.collides(body, body2, collision)) {
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
			else if(body.x > 800) {
				body.x             = 800;
				body.direction_x *= -1;
			}

			if(body.y < 0) {
				body.y            = 0;
				body.direction_y *= -1;
			}
			else if(body.y > 600) {
				body.y            = 600;
				body.direction_y *= -1;
			}
		}

		// Clear the canvas
		this.context.fillStyle = '#000000';
		this.context.fillRect(0, 0, 800, 600);

		// Render the bodies
		this.context.fillStyle = '#FFFFFF';

		Utils.render(this.context, this.bodies);

		this.context.fillStyle = '#FC0';
		this.context.fillText(average_fps, 10, 30);
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

		body.direction_x = Math.cos(direction);
		body.direction_y = Math.sin(direction);

		this.bodies.push(body);
	}
}
