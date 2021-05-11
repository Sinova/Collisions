import {Polygon} from './Polygon.js';

/**
 * A point used to detect collisions
 */
export class Point extends Polygon {
	// TODO should this set `_polygon` to `false`?
	_point = true;

	/**
	 * x: The starting X coordinate
	 * y: The starting Y coordinate
	 * padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, padding = 0) {
		super(x, y, [[0, 0]], 0, 1, 1, padding);
	}

	// Remove the `Polygon` method that doesn't apply to points.
	// Is there a better pattern for this? Throwing in the function body seems worse.
	setPoints = undefined as any;
}
