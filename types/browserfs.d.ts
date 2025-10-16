import  { type Stats } from "browserfs/dist/node/core/node_fs_stats";

export interface BrowserFSError extends Error {
  code: string;
  path?: string;
}

export interface BrowserFSStats extends Stats {
  isDirectory: () => boolean;
}

export interface BrowserFSFileType {
  DIRECTORY: number;
  FILE: number;
  SYMLINK: number;
}

export type BrowserFSStatsConstructor = new (
    type: number,
    size: number,
    mode?: number,
    atime?: Date,
    mtime?: Date,
    ctime?: Date,
    birthtime?: Date
  ) => BrowserFSStats;

export interface FSStatics {
  FileType: BrowserFSFileType;
  Stats: BrowserFSStatsConstructor;
}

export interface FSError {
  code: string;
  path?: string;
}
