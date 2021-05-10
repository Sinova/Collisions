import type {Task} from '@feltcoop/gro';

export const task: Task = {
	description: 'build the project',
	dev: false,
	run: async ({invokeTask, fs}): Promise<void> => {
		await invokeTask('gro/build');
		// TODO replace with new build system in gro@0.22
		await fs.remove('dist');
		await fs.copy('.gro/prod/lib', 'dist', {filter: (file) => !file.endsWith('.map')});
	},
};
