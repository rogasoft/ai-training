import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: new URL('./src/lib/layouts/runbook.svelte', import.meta.url).pathname } })],
      adapter: adapter({ strict: false }),
      prerender: { entries: ['*', '/kb/incidents/4471/causes'], handleHttpError: 'warn' }
    })
  ]
};
