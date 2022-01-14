import {type GroConfigCreator, type GroConfigPartial} from '@feltcoop/gro';

/*

Extends the default config with library bundling.

*/

export const config: GroConfigCreator = async () => {
	const partial: GroConfigPartial = {
		adapt: async () => [
			(await import('@feltcoop/gro/dist/adapt/groAdapterNodeLibrary.js')).createAdapter({
				bundle: true,
			}),
		],
	};
	return partial;
};
