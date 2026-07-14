import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "html/dashboard.html",
        auth: "html/auth.html",
        profile: "html/profile.html",
        location: "html/location.html",
        search: "html/search.html",
        view: "html/view.html"
      }
    }
  }
});