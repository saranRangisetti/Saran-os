#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Generate routes-manifest.json for Vercel
const routesManifest = {
  version: 3,
  pages404: false,
  caseSensitive: false,
  routes: [
    {
      page: "/",
      regex: "^/$",
    },
    {
      page: "/404",
      regex: "^/404$",
    },
  ],
  dynamicRoutes: [],
  dataRoutes: [],
  rewrites: [],
  redirects: [],
  headers: [],
  i18n: null,
  basePath: "",
  trailingSlash: true,
};

const outputPath = path.join(__dirname, "..", "out", "routes-manifest.json");

// Ensure out directory exists
const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write routes manifest
fs.writeFileSync(outputPath, JSON.stringify(routesManifest, null, 2));

console.log("✅ Generated routes-manifest.json for Vercel");
