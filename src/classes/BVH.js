const sortNodes = (a, b) => a.sort > b.sort ? -1 : 1;

export default class BVH {
	constructor() {
		this._tree  = null;
		this._dirty = [];
	}

	collides(a, b) {

	}

	insert(new_node) {
		const polygon    = new_node.polygon;
		const radius     = polygon ? 0 : new_node.radius * new_node.scale;
		const body_x     = new_node.x;
		const body_y     = new_node.y;
		const body_min_x = body_x + (polygon ? new_node._min_x : -radius) - 0;
		const body_min_y = body_y + (polygon ? new_node._min_y : -radius) - 0;
		const body_max_x = body_x + (polygon ? new_node._max_x : radius) + 0;
		const body_max_y = body_y + (polygon ? new_node._max_y : radius) + 0;

		new_node._bvh_min_x = body_min_x;
		new_node._bvh_min_y = body_min_y;
		new_node._bvh_max_x = body_max_x;
		new_node._bvh_max_y = body_max_y;

		let node = this._tree;
		let sort = 0;

		if(!node) {
			this._tree = new_node;
		}
		else {
			while(true) {
				// Branch
				if(node._bvh_branch) {
					const left_node        = node._bvh_left;
					const left_min_x       = left_node._bvh_min_x;
					const left_min_y       = left_node._bvh_min_y;
					const left_max_x       = left_node._bvh_max_x;
					const left_max_y       = left_node._bvh_max_y;
					const left_new_min_x   = body_min_x < left_min_x ? body_min_x : left_min_x;
					const left_new_min_y   = body_min_y < left_min_y ? body_min_y : left_min_y;
					const left_new_max_x   = body_max_x > left_max_x ? body_max_x : left_max_x;
					const left_new_max_y   = body_max_y > left_max_y ? body_max_y : left_max_y;
					const left_volume      = (left_max_x - left_min_x) * (left_max_y - left_min_y);
					const left_new_volume  = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
					const left_difference  = left_new_volume - left_volume;

					const right_node       = node._bvh_right;
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

					node._bvh_sort  = sort++;
					node._bvh_min_x = left_new_min_x < right_new_min_x ? left_new_min_x : right_new_min_x;
					node._bvh_min_y = left_new_min_y < right_new_min_y ? left_new_min_y : right_new_min_y;
					node._bvh_max_x = left_new_max_x > right_new_max_x ? left_new_max_x : right_new_max_x;
					node._bvh_max_y = left_new_max_y > right_new_max_y ? left_new_max_y : right_new_max_y;

					node = left_difference <= right_difference ? left_node : right_node;
				}
				// Leaf
				else {
					const grandparent  = node._bvh_parent;
					const parent_min_x = node._bvh_min_x;
					const parent_min_y = node._bvh_min_y;
					const parent_max_x = node._bvh_max_x;
					const parent_max_y = node._bvh_max_y;

					const new_parent = node._bvh_parent = new_node._bvh_parent = {
						_bvh_branch : true,
						_bvh_dirty  : false,
						_bvh_parent : grandparent,
						_bvh_left   : node,
						_bvh_right  : new_node,
						_bvh_sort   : sort++,
						_bvh_min_x  : body_min_x < parent_min_x ? body_min_x : parent_min_x,
						_bvh_min_y  : body_min_y < parent_min_y ? body_min_y : parent_min_y,
						_bvh_max_x  : body_max_x > parent_max_x ? body_max_x : parent_max_x,
						_bvh_max_y  : body_max_y > parent_max_y ? body_max_y : parent_max_y,
					};

					node._bvh_sort = new_node._bvh_sort = sort;

					if(!grandparent) {
						this._tree = new_parent;
					}
					else if(grandparent._bvh_left === node) {
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

	remove(node) {
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

	update() {
		const dirty = this._dirty;
		const count = dirty.length;

		// Start with the deepest nodes first
		dirty.sort(sortNodes);

		for(let i = 0; i < count; ++i) {
			let node = dirty[i];

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

				// If the parent is dirty, it should be coming up anyway in the for() loop so bail out
				if(node && node._bvh_dirty) {
					break;
				}
			}
		}

		dirty.length = 0;
	}
}
