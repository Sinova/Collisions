import type {SomeBody} from './Body';

const branch_pool: BVHBranch[] = [];

/**
 * A branch within a BVH
 */
export class BVHBranch {
	_bvh_branch = true;
	_bvh_parent: null | BVHBranch = null;
	_bvh_left: null | BVHBranch | SomeBody = null;
	_bvh_right: null | BVHBranch | SomeBody = null;
	_bvh_sort = 0;
	_bvh_min_x = 0;
	_bvh_min_y = 0;
	_bvh_max_x = 0;
	_bvh_max_y = 0;

	/**
	 * Returns a branch from the branch pool or creates a new branch
	 */
	static getBranch(): BVHBranch {
		if (branch_pool.length) {
			return branch_pool.pop()!;
		}

		return new BVHBranch();
	}

	/**
	 * Releases a branch back into the branch pool
	 * 		branch: The branch to release
	 */
	static releaseBranch(branch: BVHBranch): void {
		branch_pool.push(branch);
	}

	/**
	 * Sorting callback used to sort branches by deepest first
	 * 		a: The first branch
	 * 		b: The second branch
	 */
	static sortBranches(a: BVHBranch, b: BVHBranch): number {
		return a._bvh_sort > b._bvh_sort ? -1 : 1;
	}
}
