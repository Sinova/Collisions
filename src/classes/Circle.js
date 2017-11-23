import Body from './Body.js';

export default class Circle extends Body {
	/**
	 * Creates a circle used to detect collisions
	 * @param {Number} x The starting X coordinate
	 * @param {Number} y The starting Y coordinate
	 * @param {Number} radius The radius
	 * @param {Number} scale The scale
	 * @param {Number} padding The amount to pad the bounding volume when checking for potential collisions
	 * @constructor
	 */
	constructor(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
		super();

		this.x       = x;
		this.y       = y;
		this.radius  = radius;
		this.scale   = scale;

		this._polygon = false;
	}

	/**
	 * Adds an arc representing the circle to a canvas context's current path
	 * @param {CanvasRenderingContext2D} context The context to add the arc to
	 */
	render(context) {
		const x      = this.x;
		const y      = this.y;
		const radius = this.radius * this.scale;

		context.moveTo(x + radius, y);
		context.arc(x, y, radius, 0, Math.PI * 2);
	}
};
