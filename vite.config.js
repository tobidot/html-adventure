// vite.config.js
import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';
import alias from "@rollup/plugin-alias";

export default defineConfig({
	// set the assets directory to relative path when building for production
	base: './',
	plugins: [
		injectHTML(),
		tsconfigPaths(),
	],
	resolve: {
		alias: {
			// '+': path.resolve(__dirname, './assets'),
		},
	},
	assetsInclude: [
		// '**/*.svg'
	],
	build: {
		assetsInlineLimit: 0,
	}
});