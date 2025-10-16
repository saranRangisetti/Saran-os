// Specific type declarations for public/.index JSON files
declare module "public/.index/desktopIcons.json" {
  const value: string[];
  export default value;
}

declare module "public/.index/startMenuIcons.json" {
  const value: string[];
  export default value;
}

declare module "public/.index/iniIcons.json" {
  const value: Record<string, string>;
  export default value;
}

declare module "public/.index/shortcutCache.json" {
  type ShortcutData = {
    BaseURL?: string;
    Comment?: string;
    IconFile?: string;
    Type?: string;
    URL?: string;
  };
  const value: Record<string, Record<string, ShortcutData>>;
  export default value;
}

declare module "public/.index/fs.9p.json" {
  type FS9PV4 = [string, number, number, FS9PV4[] | undefined];
  type FS9PV3 = [
    string,
    number,
    number,
    number,
    number,
    number,
    FS9PV3[] | string,
  ];
  type FS9PIndex = {
    fsroot: FS9PV4[] | FS9PV3[];
    size: number;
    version: 3 | 4;
  };
  const value: FS9PIndex;
  export default value;
}

// Generic fallback for other JSON files
declare module "*.json" {
  const value: unknown;
  export default value;
}
