import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';
import SAT     from './classes/SAT.js';

const sortNodes      = (a, b) => a.sort > b.sort ? -1 : 1;
const traverse_stack = [];

export default class Collisions {
	constructor(padding = 0) {
		this._padding = padding;
		this._tree    = null;
		this._bodies  = [];
		this._dirty   = [];
	}

	createCircle(x = 0, y = 0, radius = 0, scale = 1) {
		const circle = new Circle(x, y, radius, scale);

		this.insert(circle);

		return circle;
	}

	createPolygon(x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1) {
		const polygon = new Polygon(x, y, points, angle, scale_x, scale_y);

		this.insert(polygon);

		return polygon;
	}

	insert(node) {
		return this._insert(node, false);
	}

	remove(node) {
		return this._remove(node, false);
	}

	update() {
		this._updateBodies();
		this._resizeNodes();
	}

	collides(a, b, out = null) {
		let quick_check = false;

		if(b._bvh_potential_cache) {
			const collisions = b._bvh_potentials;

			quick_check = collisions.length && collisions.includes(a);
		}
		else {
			const collisions = a._bvh_potential_cache ? a._bvh_potentials : this.potentials(a);

			quick_check = collisions.length && collisions.includes(b);
		}

		return quick_check && SAT.collides(a, b, out, true);
	}

	potentials(node) {
		const collisions = node._bvh_potentials;

		if(!node._bvh_potential_cache) {
			let current = this._tree;

			node._bvh_potential_cache = true;
			collisions.length         = 0;

			while(
				current &&
				node._bvh_min_x < current._bvh_max_x &&
				node._bvh_min_y < current._bvh_max_y &&
				node._bvh_max_x > current._bvh_min_x &&
				node._bvh_max_y > current._bvh_min_y
			) {
				traverse_stack.push(current);
				current = current._bvh_left;
			}

			while(traverse_stack.length) {
				current = traverse_stack.pop();

				if(current._bvh_branch) {
					current = current._bvh_right;

					while(
						current &&
						node._bvh_min_x < current._bvh_max_x &&
						node._bvh_min_y < current._bvh_max_y &&
						node._bvh_max_x > current._bvh_min_x &&
						node._bvh_max_y > current._bvh_min_y
					) {
						traverse_stack.push(current);
						current = current._bvh_left;
					}
				}
				else if(current !== node) {
					collisions.push(current);
				}
			}
		}

		return collisions;
	}

	render(context) {
		let current = this._tree;

		while(current) {
			traverse_stack.push(current);
			current = current._bvh_left;
		}

		while(traverse_stack.length) {
			current = traverse_stack.pop();

			const min_x = current._bvh_min_x;
			const min_y = current._bvh_min_y;
			const max_x = current._bvh_max_x;
			const max_y = current._bvh_max_y;

			context.moveTo(min_x, min_y);
			context.lineTo(max_x, min_y);
			context.lineTo(max_x, max_y);
			context.lineTo(min_x, max_y);
			context.lineTo(min_x, min_y);

			if(current._bvh_branch) {
				current = current._bvh_right;

				while(current) {
					traverse_stack.push(current);
					current = current._bvh_left;
				}
			}
		}
	}

	_insert(node, updating) {
		if(!updating) {
			const system = node._system;

			if(system && system !== this) {
				system.remove(node);
			}

			this._bodies.push(node);
		}

		const polygon = node._polygon;
		const node_x  = node.x;
		const node_y  = node.y;

		if(polygon && (
			node._dirty_coords ||
			node_x !== node._x ||
			node_y !== node._y ||
			node.angle !== node._angle ||
			node.scale_x !== node._scale_x ||
			node.scale_y !== node._scale_y
		)) {
			node._calculateCoords();
		}

		const padding    = this._padding;
		const radius     = polygon ? 0 : node.radius * node.scale;
		const node_min_x = (polygon ? node._min_x : node_x - radius) - padding;
		const node_min_y = (polygon ? node._min_y : node_y - radius) - padding;
		const node_max_x = (polygon ? node._max_x : node_x + radius) + padding;
		const node_max_y = (polygon ? node._max_y : node_y + radius) + padding;

		node._system    = this;
		node._bvh_min_x = node_min_x;
		node._bvh_min_y = node_min_y;
		node._bvh_max_x = node_max_x;
		node._bvh_max_y = node_max_y;

		let current = this._tree;
		let sort    = 0;

		if(!current) {
			this._tree = node;
		}
		else {
			while(true) {
				// Branch
				if(current._bvh_branch) {
					const left_node        = current._bvh_left;
					const left_min_x       = left_node._bvh_min_x;
					const left_min_y       = left_node._bvh_min_y;
					const left_max_x       = left_node._bvh_max_x;
					const left_max_y       = left_node._bvh_max_y;
					const left_new_min_x   = node_min_x < left_min_x ? node_min_x : left_min_x;
					const left_new_min_y   = node_min_y < left_min_y ? node_min_y : left_min_y;
					const left_new_max_x   = node_max_x > left_max_x ? node_max_x : left_max_x;
					const left_new_max_y   = node_max_y > left_max_y ? node_max_y : left_max_y;
					const left_volume      = (left_max_x - left_min_x) * (left_max_y - left_min_y);
					const left_new_volume  = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
					const left_difference  = left_new_volume - left_volume;

					const right_node       = current._bvh_right;
					const right_min_x      = right_node._bvh_min_x;
					const right_min_y      = right_node._bvh_min_y;
					const right_max_x      = right_node._bvh_max_x;
					const right_max_y      = right_node._bvh_max_y;
					const right_new_min_x  = node_min_x < right_min_x ? node_min_x : right_min_x;
					const right_new_min_y  = node_min_y < right_min_y ? node_min_y : right_min_y;
					const right_new_max_x  = node_max_x > right_max_x ? node_max_x : right_max_x;
					const right_new_max_y  = node_max_y > right_max_y ? node_max_y : right_max_y;
					const right_volume     = (right_max_x - right_min_x) * (right_max_y - right_min_y);
					const right_new_volume = (right_new_max_x - right_new_min_x) * (right_new_max_y - right_new_min_y);
					const right_difference = right_new_volume - right_volume;

					current._bvh_sort  = sort++;
					current._bvh_min_x = left_new_min_x < right_new_min_x ? left_new_min_x : right_new_min_x;
					current._bvh_min_y = left_new_min_y < right_new_min_y ? left_new_min_y : right_new_min_y;
					current._bvh_max_x = left_new_max_x > right_new_max_x ? left_new_max_x : right_new_max_x;
					current._bvh_max_y = left_new_max_y > right_new_max_y ? left_new_max_y : right_new_max_y;

					// If we're in the middle of an "update" insertion,
					// we've just resized this node so it's no longer dirty
					if(updating && current._bvh_dirty) {
						const dirty = this._dirty;

						current._bvh_dirty = false;
						dirty.splice(dirty.indexOf(current), 1);
					}

					current = left_difference <= right_difference ? left_node : right_node;
				}
				// Leaf
				else {
					const grandparent  = current._bvh_parent;
					const parent_min_x = current._bvh_min_x;
					const parent_min_y = current._bvh_min_y;
					const parent_max_x = current._bvh_max_x;
					const parent_max_y = current._bvh_max_y;

					const new_parent = current._bvh_parent = node._bvh_parent = {
						_bvh_parent : grandparent,
						_bvh_branch : true,
						_bvh_dirty  : false,
						_bvh_left   : current,
						_bvh_right  : node,
						_bvh_sort   : sort++,
						_bvh_min_x  : node_min_x < parent_min_x ? node_min_x : parent_min_x,
						_bvh_min_y  : node_min_y < parent_min_y ? node_min_y : parent_min_y,
						_bvh_max_x  : node_max_x > parent_max_x ? node_max_x : parent_max_x,
						_bvh_max_y  : node_max_y > parent_max_y ? node_max_y : parent_max_y,
					};

					current._bvh_sort = node._bvh_sort = sort;

					if(!grandparent) {
						this._tree = new_parent;
					}
					else if(grandparent._bvh_left === current) {
						grandparent._bvh_left = new_parent;
					}
					else {
						grandparent._bvh_right = new_parent;
					}

					break;
				}
			}
		}
	}

	_remove(node, updating) {
		if(!updating) {
			if(node._system !== this) {
				throw new Error('Body does not belong to this collision system');
			}

			node._system = null;

			this._bodies.splice(this._bodies.indexOf(node), 1);
		}

		if(this._tree === node) {
			this._tree = null;

			return;
		}

		const parent       = node._bvh_parent;
		const grandparent  = parent._bvh_parent;
		const parent_left  = parent._bvh_left;
		const sibling      = parent_left === node ? parent._bvh_right : parent_left;

		sibling._bvh_parent = grandparent;
		sibling._bvh_sort   = parent._bvh_sort;

		if(grandparent) {
			if(grandparent._bvh_left === parent) {
				grandparent._bvh_left = sibling;
			}
			else {
				grandparent._bvh_right = sibling;
			}

			if(!grandparent._bvh_dirty) {
				grandparent._bvh_dirty = true;

				this._dirty.push(grandparent);
			}
		}
		else {
			this._tree = sibling;
		}
	}

	_updateBodies() {
		const nodes = this._bodies;
		const count = nodes.length;

		for(let i = 0; i < count; ++i) {
			const node    = nodes[i];
			const polygon = node._polygon;
			const x       = node.x;
			const y       = node.y;
			const radius  = polygon ? 0 : node.radius * node.scale;
			const min_x   = polygon ? node._min_x : x - radius;
			const min_y   = polygon ? node._min_y : y - radius;
			const max_x   = polygon ? node._max_x : x + radius;
			const max_y   = polygon ? node._max_y : y + radius;

			node._bvh_potential_cache = false;

			if(
				min_x < node._bvh_min_x ||
				min_y < node._bvh_min_y ||
				max_x > node._bvh_max_x ||
				max_y > node._bvh_max_y
			) {
				this._remove(node, true);
				this._insert(node, true);
			}
		}
	}

	_resizeNodes() {
		const nodes = this._dirty;
		const count = nodes.length;

		nodes.sort(sortNodes);

		for(let i = 0; i < count; ++i) {
			let node = nodes[i];

			while(node) {
				const left_node  = node._bvh_left;
				const left_min_x = left_node._bvh_min_x;
				const left_min_y = left_node._bvh_min_y;
				const left_max_x = left_node._bvh_max_x;
				const left_max_y = left_node._bvh_max_y;

				const right_node  = node._bvh_right;
				const right_min_x = right_node._bvh_min_x;
				const right_min_y = right_node._bvh_min_y;
				const right_max_x = right_node._bvh_max_x;
				const right_max_y = right_node._bvh_max_y;

				node._bvh_dirty = false;
				node._bvh_min_x = left_min_x < right_min_x ? left_min_x : right_min_x;
				node._bvh_min_y = left_min_y < right_min_y ? left_min_y : right_min_y;
				node._bvh_max_x = left_max_x > right_max_x ? left_max_x : right_max_x;
				node._bvh_max_y = left_max_y > right_max_y ? left_max_y : right_max_y;

				node = node._bvh_parent;

				// If the parent is nodes, it should be coming up anyway in the for() loop so bail out
				if(node && node._bvh_dirty) {
					break;
				}
			}
		}

		nodes.length = 0;
	}
};

Collisions.Circle   = Circle;
Collisions.Polygon  = Polygon;
Collisions.SAT      = SAT;
