import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ build: { rolldownOptions: { input: { main: 'index.html', host: 'tests/fixtures/host-theme.html' } } }, plugins: [tailwindcss()], server: { host: '127.0.0.1', port: 5179, strictPort: true }, preview: { host: '127.0.0.1', port: 5179, strictPort: true } });
