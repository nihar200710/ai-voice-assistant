import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Check if we are running the "deploy" script for GitHub Pages
  const isGitHubPages = process.env.npm_lifecycle_event === 'deploy';

  return {
    plugins: [react()],
    // If deploying to GitHub, use repo name. Otherwise (Vercel/Local), use root.
    base: isGitHubPages ? "/ai-voice-assistant/" : "/", 
  }
})