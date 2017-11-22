export default class Body {
	constructor() {
		this._system              = null;
		this._bvh_parent          = null;
		this._bvh_branch          = false;
		this._bvh_potential_cache = false;
		this._bvh_potentials      = [];
		this._bvh_sort            = 0;
		this._bvh_min_x           = 0;
		this._bvh_min_y           = 0;
		this._bvh_max_x           = 0;
		this._bvh_max_y           = 0;
	}

	collides(target, out = null) {
		const system = this._system;

		if(!system) {
			throw new Error('Body does not belong to a collision system');
		}

		if(system !== target._system) {
			throw new Error('Bodies do not belong to the same collision system');
		}

		return system.collides(this, target, out);
	}

	potentials() {
		const system = this._system;

		if(!system) {
			throw new Error('Body does not belong to a collision system');
		}

		return system.potentials(this);
	}
};
