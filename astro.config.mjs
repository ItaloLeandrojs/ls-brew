import { defineConfig } from "astro/config";

// Base do site no GitHub Pages. No Git Bash, rode com MSYS_NO_PATHCONV=1 se passar BASE.
const base = process.env.BASE || "/ls-brew/";

export default defineConfig({
  site: "https://italoleandrojs.github.io",
  base,
  trailingSlash: "always",
  build: { assets: "assets" },
});
