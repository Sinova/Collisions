import type {Task} from '@feltcoop/gro';
import type {TaskArgs as BuildTaskArgs} from '@feltcoop/gro/dist/build.task.js';

// TODO replace with new build system in gro@0.22
// TODO I'm currently just premoving `type: module` before publishing manually

export const task: Task<BuildTaskArgs> = {
	description: 'build the project',
	dev: false,
	run: async ({invokeTask, args, fs}): Promise<void> => {
		// output esm to index.mjs
		args.mapOutputOptions = (outputOptions) => {
			return {...outputOptions, sourcemap: false};
		};
		await invokeTask('gro/build');
		await fs.move('dist/index.js', 'TEMP.mjs'); // stash

		// output commonjs to index.js
		args.mapOutputOptions = (outputOptions) => {
			return {...outputOptions, format: 'commonjs', sourcemap: false};
		};
		await invokeTask('gro/build');
		await fs.move('TEMP.mjs', 'dist/index.mjs'); // unstash
	},
};
