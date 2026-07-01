import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  console.log("=== BUILD TIME ENVIRONMENT CHECK ===");
  console.log("VITE_SUPABASE_URL exists in process.env:", !!process.env.VITE_SUPABASE_URL);
  if (process.env.VITE_SUPABASE_URL) {
    console.log("VITE_SUPABASE_URL length:", process.env.VITE_SUPABASE_URL.length);
    console.log("VITE_SUPABASE_URL value starts with:", process.env.VITE_SUPABASE_URL.substring(0, 8));
  }
  console.log("VITE_SUPABASE_ANON_KEY exists in process.env:", !!process.env.VITE_SUPABASE_ANON_KEY);
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    console.log("VITE_SUPABASE_ANON_KEY length:", process.env.VITE_SUPABASE_ANON_KEY.length);
    console.log("VITE_SUPABASE_ANON_KEY starts with:", process.env.VITE_SUPABASE_ANON_KEY.substring(0, 30));
    console.log("VITE_SUPABASE_ANON_KEY ends with:", process.env.VITE_SUPABASE_ANON_KEY.substring(process.env.VITE_SUPABASE_ANON_KEY.length - 30));
  }
  console.log("====================================");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
