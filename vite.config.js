// vite.config.js
import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({
	plugins: [injectHTML()],
	// set the public directory to relative path when building for production
	base: './',
	assetsInclude: ['**/*.svg'],
});