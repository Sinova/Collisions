import type {Gro_Config_Creator, Gro_Config_Partial} from '@feltcoop/gro';

/*

Extends the default config with library bundling.

*/

export const config: Gro_Config_Creator = async () => {
	const partial: Gro_Config_Partial = {
		adapt: async () => [
			(await import('@feltcoop/gro/dist/adapt/gro_adapter_node_library.js')).create_adapter({
				bundle: true,
			}),
		],
	};
	return partial;
};
