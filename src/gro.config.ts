import type {GroConfigCreator, GroConfigPartial} from '@feltcoop/gro';
import {createFilter} from '@rollup/pluginutils';

export const config: GroConfigCreator = async () => {
	const partial: GroConfigPartial = {
		builds: [
			// TODO shouldn't have to do this - automatically add
			{
				name: 'node',
				platform: 'node',
				input: [createFilter(['**/*.{task,test,config,gen}*.ts', '**/fixtures/**'])],
				primary: true,
			},
			{
				name: 'lib',
				platform: 'node',
				input: 'index.ts',
				dist: true,
			},
		],
	};
	return partial;
};
