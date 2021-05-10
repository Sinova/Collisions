import type {SomeBody} from './Body';

/**
 * @private
 */
const branch_pool: BVHBranch[] = [];

/**
 * A branch within a BVH
 * @class
 * @private
 */
export class BVHBranch {
	_bvh_parent: null | BVHBranch = null;
	_bvh_branch = true;
	_bvh_left: null | BVHBranch | SomeBody = null;
	_bvh_right: null | BVHBranch | SomeBody = null;
	_bvh_sort = 0;
	_bvh_min_x = 0;
	_bvh_min_y = 0;
	_bvh_max_x = 0;
	_bvh_max_y = 0;

	/**
	 * Returns a branch from the branch pool or creates a new branch
	 * @returns {BVHBranch}
	 */
	static getBranch(): BVHBranch {
		if (branch_pool.length) {
			return branch_pool.pop()!;
		}

		return new BVHBranch();
	}

	/**
	 * Releases a branch back into the branch pool
	 * @param {BVHBranch} branch The branch to release
	 */
	static releaseBranch(branch: BVHBranch): void {
		branch_pool.push(branch);
	}

	/**
	 * Sorting callback used to sort branches by deepest first
	 * @param {BVHBranch} a The first branch
	 * @param {BVHBranch} b The second branch
	 * @returns {Number}
	 */
	static sortBranches(a: BVHBranch, b: BVHBranch): number {
		return a._bvh_sort > b._bvh_sort ? -1 : 1;
	}
}
