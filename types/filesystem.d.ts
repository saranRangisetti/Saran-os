export type FileSystemError = Error & {
  code: string;
  path?: string;
};

export interface FileSystemStats {
  atime: Date;
  birthtime: Date;
  ctime: Date;
  isDirectory: () => boolean;
  mode: number;
  mtime: Date;
  size: number;
}

export class BFSStats implements FileSystemStats {
  public constructor(
    type: number,
    size: number,
    mode?: number,
    atime?: Date,
    mtime?: Date,
    ctime?: Date,
    birthtime?: Date
  );

  public atime!: Date;

  public birthtime!: Date;

  public ctime!: Date;

  public mode!: number;

  public mtime!: Date;

  public size!: number;

  public isDirectory(): boolean;
}

export const FileType: {
  readonly DIRECTORY: number;
  readonly FILE: number;
  readonly SYMLINK: number;
};
