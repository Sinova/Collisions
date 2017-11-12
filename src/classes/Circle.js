import Collisions from '../Collisions.js';

export default class Circle {
	constructor(x = 0, y = 0, radius = 0) {
		this.x             = x;
		this.y             = y;
		this._radius       = radius;
		this._min_x        = 0;
		this._min_y        = 0;
		this._max_x        = 0;
		this._max_y        = 0;
		this._dirty_coords = true;

		return this;
	}

	collides(target, out) {
		return Collisions.collides(this, target, out);
	}

	getRadius() {
		return this._radius;
	}

	setRadius(radius) {
		this._radius       = radius;
		this._dirty_coords = true;

		return this;
	}

	_calculateCoords() {
		const radius = this._radius;

		this._min_x = -radius;
		this._min_y = -radius;
		this._max_x = radius;
		this._max_y = radius;

		this._dirty_coords = false;
	}
}
