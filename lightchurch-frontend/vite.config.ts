import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        // Code splitting manuel pour de meilleures performances
        manualChunks: {
          // Séparer React et ReactDOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Séparer Material-UI
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          // Séparer Leaflet
          'leaflet-vendor': ['leaflet', 'react-leaflet', 'react-leaflet-cluster'],
          // Séparer les utilitaires de date
          'date-vendor': ['date-fns']
        }
      }
    },
    // Augmenter la limite de taille pour éviter les warnings
    chunkSizeWarningLimit: 600
  }
})
