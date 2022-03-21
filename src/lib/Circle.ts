import {Body} from './Body.js';

/**
 * A circle used to detect collisions
 */
export class Circle extends Body {
	override readonly _polygon = false as const;
	override readonly _circle = true as const;
	override readonly _point = false as const;

	radius: number;
	scale: number;

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
}
