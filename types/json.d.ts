declare module "*.json" {
  const content: unknown;
  export default content;
}

// Define specific types for each JSON file
declare module "public/.index/desktopIcons.json" {
  const content: string[];
  export default content;
}

declare module "public/.index/shortcutCache.json" {
  const content: Record<string, string>;
  export default content;
}

declare module "public/.index/iniIcons.json" {
  const content: Record<string, string>;
  export default content;
}

declare module "public/.index/startMenuIcons.json" {
  const content: string[];
  export default content;
}

declare module "public/.index/fs.9p.json" {
  const content: {
    fsroot: unknown[];
    size: number;
    version: number;
  };
  export default content;
}
