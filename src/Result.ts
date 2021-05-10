import type {SomeBody} from './Body';

/**
 * An object used to collect the detailed results of a collision test
 *
 * > **Note:** It is highly recommended you recycle the same Result object if possible in order to avoid wasting memory
 * @class
 */
export class Result {
	/**
	 * @desc True if a collision was detected
	 * @type {Boolean}
	 */
	collision = false;

	/**
	 * @desc The source body tested
	 * @type {Circle|Polygon|Point}
	 */
	a: SomeBody | null = null;

	/**
	 * @desc The target body tested against
	 * @type {Circle|Polygon|Point}
	 */
	b: SomeBody | null = null;

	/**
	 * @desc True if A is completely contained within B
	 * @type {Boolean}
	 */
	a_in_b = false;

	/**
	 * @desc True if B is completely contained within A
	 * @type {Boolean}
	 */
	b_in_a = false;

	/**
	 * @desc The magnitude of the shortest axis of overlap
	 * @type {Number}
	 */
	overlap: number | null = 0; // TODO this type as used is a mismatch from the original docs

	/**
	 * @desc The X direction of the shortest axis of overlap
	 * @type {Number}
	 */
	overlap_x = 0;

	/**
	 * @desc The Y direction of the shortest axis of overlap
	 * @type {Number}
	 */
	overlap_y = 0;
}
