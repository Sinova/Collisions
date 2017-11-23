const branch_pool = [];

export default class BVH {
	/**
	 * Creates a Bounding Volume Hierarchy for finding potential collisions quickly
	 * @param {Number} padding The amount of padding around objects to minimize the number of removals/insertions when a body moves
	 */
	constructor(padding = 0) {
		this._padding = padding;
		this._tree    = null;
		this._bodies  = [];
		this._dirty   = [];
	}

	/**
	 * Inserts a node into the BVH
	 * @param {Body} body The body to insert
	 * @param {Boolean} updating Set to true if the body already exists in the BVH
	 */
	insert(body, updating = false) {
		if(!updating) {
			body._bvh = this;
			this._bodies.push(body);
		}

		const polygon = body._polygon;
		const body_x  = body.x;
		const body_y  = body.y;

		if(polygon && (
			body._dirty_coords ||
			body_x !== body._x ||
			body_y !== body._y ||
			body.angle !== body._angle ||
			body.scale_x !== body._scale_x ||
			body.scale_y !== body._scale_y
		)) {
			body._calculateCoords();
		}

		const padding    = this._padding;
		const radius     = polygon ? 0 : body.radius * body.scale;
		const body_min_x = (polygon ? body._min_x : body_x - radius) - padding;
		const body_min_y = (polygon ? body._min_y : body_y - radius) - padding;
		const body_max_x = (polygon ? body._max_x : body_x + radius) + padding;
		const body_max_y = (polygon ? body._max_y : body_y + radius) + padding;

		body._bvh_min_x = body_min_x;
		body._bvh_min_y = body_min_y;
		body._bvh_max_x = body_max_x;
		body._bvh_max_y = body_max_y;

		let current = this._tree;
		let sort    = 0;

		if(!current) {
			this._tree = body;
		}
		else {
			while(true) {
				// Branch
				if(current._bvh_branch) {
					const left_node        = current._bvh_left;
					const left_min_y       = left_node._bvh_min_y;
					const left_max_x       = left_node._bvh_max_x;
					const left_max_y       = left_node._bvh_max_y;
					const left_new_min_x   = body_min_x < left_node._bvh_min_x ? body_min_x : left_node._bvh_min_x;
					const left_new_min_y   = body_min_y < left_min_y ? body_min_y : left_min_y;
					const left_new_max_x   = body_max_x > left_max_x ? body_max_x : left_max_x;
					const left_new_max_y   = body_max_y > left_max_y ? body_max_y : left_max_y;
					const left_volume      = (left_max_x - left_node._bvh_min_x) * (left_max_y - left_min_y);
					const left_new_volume  = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
					const left_difference  = left_new_volume - left_volume;

					const right_node       = current._bvh_right;
					const right_min_x      = right_node._bvh_min_x;
					const right_min_y      = right_node._bvh_min_y;
					const right_max_x      = right_node._bvh_max_x;
					const right_max_y      = right_node._bvh_max_y;
					const right_new_min_x  = body_min_x < right_min_x ? body_min_x : right_min_x;
					const right_new_min_y  = body_min_y < right_min_y ? body_min_y : right_min_y;
					const right_new_max_x  = body_max_x > right_max_x ? body_max_x : right_max_x;
					const right_new_max_y  = body_max_y > right_max_y ? body_max_y : right_max_y;
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
					const new_parent   = current._bvh_parent = body._bvh_parent = getBranch();

					new_parent._bvh_parent = grandparent;
					new_parent._bvh_dirty  = false;
					new_parent._bvh_left   = current;
					new_parent._bvh_right  = body;
					new_parent._bvh_sort   = sort++;
					new_parent._bvh_min_x  = body_min_x < parent_min_x ? body_min_x : parent_min_x;
					new_parent._bvh_min_y  = body_min_y < parent_min_y ? body_min_y : parent_min_y;
					new_parent._bvh_max_x  = body_max_x > parent_max_x ? body_max_x : parent_max_x;
					new_parent._bvh_max_y  = body_max_y > parent_max_y ? body_max_y : parent_max_y;

					current._bvh_sort = body._bvh_sort = sort;

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

	/**
	 * Removes a node from the BVH
	 * @param {Body} body The body to remove
	 * @param {Boolean} updating Set to true if this is a temporary removal just to update the body's position
	 */
	remove(body, updating = false) {
		if(!updating) {
			body._bvh = null;
			this._bodies.splice(this._bodies.indexOf(body), 1);
		}

		if(this._tree === body) {
			this._tree = null;

			return;
		}

		const parent       = body._bvh_parent;
		const grandparent  = parent._bvh_parent;
		const parent_left  = parent._bvh_left;
		const sibling      = parent_left === body ? parent._bvh_right : parent_left;

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

		branch_pool.push(parent);
	}

	/**
	 * Updates the BVH
	 * Moved bodies are removed and inserted, and their parent nodes are resized
	 */
	update() {
		let count;

		// Updated moved bodies
		const bodies = this._bodies;

		count = bodies.length;

		for(let i = 0; i < count; ++i) {
			const body    = bodies[i];
			const polygon = body._polygon;
			const x       = body.x;
			const y       = body.y;
			const radius  = polygon ? 0 : body.radius * body.scale;
			const min_x   = polygon ? body._min_x : x - radius;
			const min_y   = polygon ? body._min_y : y - radius;
			const max_x   = polygon ? body._max_x : x + radius;
			const max_y   = polygon ? body._max_y : y + radius;

			if(
				min_x < body._bvh_min_x ||
				min_y < body._bvh_min_y ||
				max_x > body._bvh_max_x ||
				max_y > body._bvh_max_y
			) {
				this.remove(body, true);
				this.insert(body, true);
			}
		}

		// Resize nodes
		const nodes = this._dirty;

		count = nodes.length;

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

				// If the parent is dirty, it should be coming up in the for() loop anyway, so bail out
				if(node && node._bvh_dirty) {
					break;
				}
			}
		}

		nodes.length = 0;
	}

	/**
	 * Returns a list of potential collisions for a body
	 * @param {Body} body The body to test for potential collisions against
	 * @returns Iterator
	 */
	*potentials(body) {
		const tree  = this._tree;
		const min_x = body._bvh_min_x;
		const min_y = body._bvh_min_y;
		const max_x = body._bvh_max_x;
		const max_y = body._bvh_max_y;

		let current = tree;

		while(current) {
			if(!current._bvh_iterated) {
				current._bvh_iterated = true;

				if(
					current === body ||
					current._bvh_max_x < min_x ||
					current._bvh_max_y < min_y ||
					current._bvh_min_x > max_x ||
					current._bvh_min_y > max_y
				) {
					current = current._bvh_parent;
					continue;
				}

				if(!current._bvh_branch) {
					yield current;
				}
			}

			const left_node = current._bvh_left;

			if(left_node && !left_node._bvh_iterated) {
				current = left_node;
				continue;
			}

			const right_node = current._bvh_right;

			if(right_node && !right_node._bvh_iterated) {
				current = right_node;
				continue;
			}

			if(left_node) {
				left_node._bvh_iterated = false;
			}

			if(right_node) {
				right_node._bvh_iterated = false;
			}

			current = current._bvh_parent;
		}
	}

	/**
	 * Adds lines and arcs representing the bodies within the BVH to a canvas context's current path
	 * @param {CanvasRenderingContext2D} context The context to add lines and arcs to
	 * @param {Boolean} debug Set to true to draw the BVH itself
	 */
	render(context, debug = false) {
		const bodies = this._bodies;
		const count  = bodies.length;

		for(let i = 0; i < count; ++i) {
			bodies[i].render(context);
		}

		if(debug) {
			let current = this._tree;

			while(current) {
				if(!current._bvh_iterated) {
					current._bvh_iterated = true;

					const min_x = current._bvh_min_x;
					const min_y = current._bvh_min_y;
					const max_x = current._bvh_max_x;
					const max_y = current._bvh_max_y;

					context.moveTo(min_x, min_y);
					context.lineTo(max_x, min_y);
					context.lineTo(max_x, max_y);
					context.lineTo(min_x, max_y);
					context.lineTo(min_x, min_y);
				}

				const left_node = current._bvh_left;

				if(left_node && !left_node._bvh_iterated) {
					current = left_node;
					continue;
				}

				const right_node = current._bvh_right;

				if(right_node && !right_node._bvh_iterated) {
					current = right_node;
					continue;
				}

				if(left_node) {
					left_node._bvh_iterated = false;
				}

				if(right_node) {
					right_node._bvh_iterated = false;
				}

				current = current._bvh_parent;
			}
		}
	}
}

/**
 * Sorts nodes by deepest first
 * @param {Object} a The first node
 * @param {Object} b The second node
 * @returns Number
 */
function sortNodes(a, b) {
	return a.sort > b.sort ? -1 : 1;
}

/**
 * Returns a branch from the branch pool or creates a new branch
 * @returns Object
 */
function getBranch() {
	if(branch_pool.length) {
		return branch_pool.pop();
	}

	return {
		_bvh_parent   : null,
		_bvh_branch   : true,
		_bvh_dirty    : false,
		_bvh_iterated : false,
		_bvh_left     : null,
		_bvh_right    : null,
		_bvh_sort     : 0,
		_bvh_min_x    : 0,
		_bvh_min_y    : 0,
		_bvh_max_x    : 0,
		_bvh_max_y    : 0,
	};
}
