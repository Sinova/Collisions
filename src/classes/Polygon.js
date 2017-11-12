import Collisions from '../Collisions.js';

export default class Polygon {
	constructor(x = 0, y = 0, points = [], angle = 0) {
		this.x             = x;
		this.y             = y;
		this._angle        = angle;
		this._points       = [];
		this._coords       = [];
		this._edges        = [];
		this._normals      = [];
		this._min_x        = 0;
		this._min_y        = 0;
		this._max_x        = 0;
		this._max_y        = 0;
		this._dirty_coords = true;
		this._dirty_axes   = true;

		this.setPoints(points);
	}

	collides(target, out) {
		return Collisions.collides(this, target, out);
	}

	setPoints(new_points) {
		const points  = this._points;
		const coords  = this._coords;
		const edges   = this._edges;
		const normals = this._normals;
		const count   = new_points.length;

		let sign = false;

		points.length  =
		coords.length  =
		edges.length   =
		normals.length = count;

		for(let i = 0; i < count; ++i) {
			if(!points[i]) {
				points[i]  = [0, 0];
				coords[i]  = [0, 0];
				edges[i]   = [0, 0];
				normals[i] = [0, 0];
			}

			const point     = points[i];
			const new_point = new_points[i];

			point[0] = new_point[0];
			point[1] = new_point[1];
		}

		this._dirty_coords = true;
		this._dirty_axes   = true;
	}

	setAngle(angle = 0) {
		this._angle        = angle;
		this._dirty_coords = true;
		this._dirty_axes   = true;
	}

	_calculateCoords() {
		const points = this._points;
		const coords = this._coords;
		const angle  = this._angle;
		const count  = points.length;

		let min_x = null;
		let max_x = null;
		let min_y = null;
		let max_y = null;

		for(let i = 0; i < count; ++i) {
			const point = points[i];
			const coord = coords[i];
			const raw_x = point[0];
			const raw_y = point[1];

			if(angle) {
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);

				coord[0] = raw_x * cos - raw_y * sin;
				coord[1] = raw_x * sin + raw_y * cos;
			}
			else {
				coord[0] = raw_x;
				coord[1] = raw_y;
			}

			const x = coord[0];
			const y = coord[1];

			if(i === 0) {
				min_x = max_x = x;
				min_y = max_y = y;
			}
			else {
				if(x < min_x) {
					min_x = x;
				}
				else if(x > max_x) {
					max_x = x;
				}

				if(y < min_y) {
					min_y = y;
				}
				else if(y > max_y) {
					max_y = y;
				}
			}
		}

		this._min_x        = min_x;
		this._min_y        = min_y;
		this._max_x        = max_x;
		this._max_y        = max_y;
		this._dirty_coords = false;
	}

	_calculateAxes() {
		const coords  = this._coords;
		const edges   = this._edges;
		const normals = this._normals;
		const count   = coords.length;

		if(this._dirty_coords) {
			this._calculateCoords();
		}

		for(let i = 0; i < count; ++i) {
			const next   = i + 1;
			const edge   = edges[i];
			const normal = normals[i];
			const a      = coords[i];
			const b      = next < count ? coords[next] : coords[0];
			const x      = b[0] - a[0];
			const y      = b[1] - a[1];
			const length = Math.sqrt(x * x + y * y);

			edge[0]   = x;
			edge[1]   = y;
			normal[0] = length ? y / length : 0;
			normal[1] = length ? -x / length : 0;
		}

		this._dirty_axes = false;
	}
}
