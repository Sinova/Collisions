import {Body} from './Body.js';

/**
 * A circle used to detect collisions
 */
export class Circle extends Body {
	radius: number;
	scale: number;

	override _circle = true;

	/**
	 * x: The starting X coordinate
	 * y: The starting Y coordinate
	 * radius
	 * scale
	 * padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
		super(x, y, padding);

		this.radius = radius;
		this.scale = scale;
	}

	/**
	 * Draws the circle to a CanvasRenderingContext2D's current path
	 * 		context: The context to add the arc to
	 */
	draw(context: CanvasRenderingContext2D): void {
		const x = this.x;
		const y = this.y;
		const radius = this.radius * this.scale;

		context.moveTo(x + radius, y);
		context.arc(x, y, radius, 0, Math.PI * 2);
	}
}
