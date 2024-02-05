import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'//Dhayan se "NOT USE IN PRODUCTION" (for https)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()
    // ,basicSsl()
  ],
})
