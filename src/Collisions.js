// Any lookup or calculation used more than once is assigned to a variable
// https://jsperf.com/array-lookup-vs-const
// https://jsperf.com/duplicate-math-vs-const

import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';

export default {
	Circle,
	Polygon,
	collides,
};

let project_x = 0;
let project_y = 0;

function collides(a, b, out = null, aabb = true) {
	const a_polygon = a.radius === undefined;
	const b_polygon = b.radius === undefined;

	if(a_polygon && a._dirty_coords || a.angle !== a._angle || a.scale_x !== a._scale_x || a.scale_y !== a._scale_y) {
		a._calculateCoords();
	}

	if(b_polygon && b._dirty_coords || b.angle !== b._angle || b.scale_x !== b._scale_x || b.scale_y !== b._scale_y) {
		b._calculateCoords();
	}

	if(aabb && !aabbAABB(a, b)) {
		return false;
	}

	if(a_polygon && a._dirty_normals) {
		a._calculateNormals();
	}

	if(b_polygon && b._dirty_normals) {
		b._calculateNormals();
	}

	return (
		a_polygon && b_polygon ? polygonPolygon(a, b, out) :
		a_polygon ? polygonCircle(a, b, out, false) :
		b_polygon ? polygonCircle(b, a, out, true) :
		circleCircle(a, b, out)
	);
}

function aabbAABB(a, b) {
	const a_polygon = a.radius === undefined;
	const b_polygon = b.radius === undefined;
	const a_radius  = a_polygon ? 0 : a.radius * a.scale;
	const b_radius  = b_polygon ? 0 : b.radius * b.scale;
	const x_diff    = b.x - a.x;
	const y_diff    = b.y - a.y;

	if(
		(a_polygon ? a._min_x : -a_radius) > (b_polygon ? b._max_x : b_radius) + x_diff ||
		(a_polygon ? a._min_y : -a_radius) > (b_polygon ? b._max_y : b_radius) + y_diff ||
		(a_polygon ? a._max_x : a_radius) < (b_polygon ? b._min_x : -b_radius) + x_diff ||
		(a_polygon ? a._max_y : a_radius) < (b_polygon ? b._min_y : -b_radius) + y_diff
	) {
		return false;
	}

	return true;
}

function polygonPolygon(a, b, out) {
	const a_normals = a._normals;
	const b_normals = b._normals;
	const a_count   = a._coords.length;
	const b_count   = b._coords.length;

	if(out) {
		out.a         = a;
		out.b         = b;
		out.a_in_b    = true;
		out.b_in_a    = true;
		out.overlap   = a_count === 2 && b_count === 2 ? 0 : Number.MAX_VALUE;
		out.overlap_x = 0;
		out.overlap_y = 0;
	}

	if(a_count > 2) {
		for(let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
			if(separatingAxis(a, b, a_normals[ix], a_normals[iy], out)) {
				return false;
			}
		}
	}

	if(b_count > 2) {
		for(let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
			if(separatingAxis(a, b, b_normals[ix], b_normals[iy], out)) {
				return false;
			}
		}
	}

	return true;
}

function polygonCircle(a, b, out, reverse) {
	const a_coords       = a._coords;
	const a_edges        = a._edges;
	const a_normals      = a._normals;
	const b_radius       = b.radius;
	const b_radius2      = b_radius * 2;
	const difference_x   = b.x - a.x;
	const difference_y   = b.y - a.y;
	const radius_squared = b_radius * b_radius;
	const count          = a_coords.length;

	let a_in_b    = true;
	let b_in_a    = true;
	let overlap   = Number.MAX_VALUE;
	let overlap_x = 0;
	let overlap_y = 0;

	for(let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
		const edge_x  = a_edges[ix];
		const edge_y  = a_edges[iy];
		const coord_x = difference_x - a_coords[ix];
		const coord_y = difference_y - a_coords[iy];
		const dot     = edge_x * coord_x + edge_y * coord_y;
		const region  = dot < 0 ? -1 : dot > edge_x * edge_x + edge_y * edge_y ? 1 : 0;

		let tmp_overlapping = false;
		let tmp_overlap     = 0;
		let tmp_overlap_x   = 0;
		let tmp_overlap_y   = 0;

		if(out && a_in_b && coord_x * coord_x + coord_y * coord_y > radius_squared) {
			a_in_b = false;
		}

		if(region) {
			const left     = region === -1;
			const other_x  = left ? (ix === 0 ? count - 2 : ix - 2) : (ix === count - 2 ? 0 : ix + 2);
			const other_y  = other_x + 1;
			const edge2_x  = a_edges[other_x];
			const edge2_y  = a_edges[other_y];
			const coord2_x = difference_x - a_coords[other_x];
			const coord2_y = difference_y - a_coords[other_y];
			const dot2     = edge2_x * coord2_x + edge2_y * coord2_y;
			const region2  = dot2 < 0 ? -1 : dot2 > edge2_x * edge2_x + edge2_y * edge2_y ? 1 : 0;

			if(region2 === -region) {
				const target_x       = left ? coord_x : coord2_x;
				const target_y       = left ? coord_y : coord2_y;
				const length_squared = target_x * target_x + target_y * target_y;

				if(length_squared > radius_squared) {
					return false;
				}

				if(out) {
					const length = Math.sqrt(length_squared);

					b_in_a          = false;
					tmp_overlapping = true;
					tmp_overlap     = b_radius - length;
					tmp_overlap_x   = target_x / length;
					tmp_overlap_y   = target_y / length;
				}
			}
		}
		else {
			const normal_x        = a_normals[ix];
			const normal_y        = a_normals[iy];
			const length          = coord_x * normal_x + coord_y * normal_y;
			const absolute_length = length < 0 ? -length : length;

			if(length > 0 && absolute_length > b_radius) {
				return false;
			}

			if(out) {
				tmp_overlapping = true;
				tmp_overlap     = b_radius - length;
				tmp_overlap_x   = normal_x;
				tmp_overlap_y   = normal_y;

				if(b_in_a && length >= 0 || tmp_overlap < b_radius2) {
					b_in_a = false;
				}
			}
		}

		if(tmp_overlapping && tmp_overlap < overlap) {
			overlap   = tmp_overlap;
			overlap_x = tmp_overlap_x;
			overlap_y = tmp_overlap_y;
		}
	}

	if(out) {
		out.a         = reverse ? b : a;
		out.b         = reverse ? a : b;
		out.a_in_b    = reverse ? b_in_a : a_in_b;
		out.b_in_a    = reverse ? a_in_b : b_in_a;
		out.overlap   = overlap;
		out.overlap_x = reverse ? -overlap_x : overlap_x;
		out.overlap_y = reverse ? -overlap_y : overlap_y;
	}

	return true;
}

function circleCircle(a, b, out) {
	const a_radius       = a.radius;
	const b_radius       = b.radius;
	const difference_x   = b.x - a.x;
	const difference_y   = b.y - a.y;
	const radius_sum     = a_radius + b_radius;
	const length_squared = difference_x * difference_x + difference_y * difference_y;

	if(length_squared > radius_sum * radius_sum) {
		return false;
	}

	if(out) {
		const length = Math.sqrt(length_squared);

		out.a         = a;
		out.b         = b;
		out.a_in_b    = a_radius <= b_radius && length <= b_radius - a_radius;
		out.b_in_a    = b_radius <= a_radius && length <= a_radius - b_radius;
		out.overlap   = radius_sum - length;
		out.overlap_x = difference_x / length;
		out.overlap_y = difference_y / length;
	}

	return true;
}

function separatingAxis(a, b, x, y, out) {
	const offset = (b.x - a.x) * x + (b.y - a.y) * y;

	projectPolygon(a, x, y);

	const a_x = project_x;
	const a_y = project_y;

	projectPolygon(b, x, y);

	const b_x = project_x + offset;
	const b_y = project_y + offset;

	if(a_x > b_y || b_x > a_y) {
		return true;
	}

	if(out) {
		let overlap = 0;

		if(a_x < b_x) {
			out.a_in_b = false;

			if(a_y < b_y) {
				overlap    = a_y - b_x;
				out.b_in_a = false;
			}
			else {
				const option1 = a_y - b_x;
				const option2 = b_y - a_x;

				overlap = option1 < option2 ? option1 : -option2;
			}
		}
		else {
			out.b_in_a = false;

			if(a_y > b_y) {
				overlap    = a_x - b_y;
				out.a_in_b = false;
			}
			else {
				const option1 = a_y - b_x;
				const option2 = b_y - a_x;

				overlap = option1 < option2 ? option1 : -option2;
			}
		}

		const absolute_overlap = overlap < 0 ? -overlap : overlap;

		if(absolute_overlap < out.overlap) {
			const sign = overlap < 0 ? -1 : 1;

			out.overlap   = absolute_overlap;
			out.overlap_x = x * sign;
			out.overlap_y = y * sign;
		}
	}

	return false;
}

function projectPolygon(polygon, x, y) {
	const coords = polygon._coords;
	const count  = coords.length;

	let min = Number.MAX_VALUE;
	let max = -Number.MAX_VALUE;

	for(let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
		const dot = coords[ix] * x + coords[iy] * y;

		if(dot < min) {
			min = dot;
		}

		if(dot > max) {
			max = dot;
		}
	}

	project_x = min;
	project_y = max;
}
