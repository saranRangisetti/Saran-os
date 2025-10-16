import { join } from "path";
import { useEffect, useMemo, useRef, useState } from "react";
import * as BrowserFS from "browserfs";
import { type FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import type EmscriptenFileSystem from "browserfs/dist/node/backend/Emscripten";
import type MountableFileSystem from "browserfs/dist/node/backend/MountableFileSystem";
import { isExistingFile } from "components/system/Files/FileEntry/functions";
import {
  UNKNOWN_STATE_CODES,
  get9pSize,
  supportsIndexedDB,
} from "contexts/fileSystem/core";
import FileSystemConfig from "contexts/fileSystem/FileSystemConfig";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  SESSION_FILE,
} from "utils/constants";

type ErrorCode = "ENOTSUP" | "EISDIR" | "EEXIST" | "ENOENT";

interface FSError extends Error {
  code: ErrorCode;
  path?: string;
}

const { BFSRequire, configure } = BrowserFS;

export type AsyncFS = {
  exists: (path: string) => Promise<boolean>;
  lstat: (path: string) => Promise<Stats>;
  mkdir: (path: string, overwrite?: boolean) => Promise<boolean>;
  readFile: (path: string) => Promise<Buffer>;
  readdir: (path: string) => Promise<string[]>;
  rename: (oldPath: string, newPath: string) => Promise<boolean>;
  rmdir: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<Stats>;
  unlink: (path: string) => Promise<boolean>;
  writeFile: (
    path: string,
    data: Buffer | string,
    overwrite?: boolean
  ) => Promise<boolean>;
};

type FSStatics = {
  FileType: {
    DIRECTORY: number;
    FILE: number;
    SYMLINK: number;
  };
  Stats: new (
    type: number,
    size: number,
    mode?: number,
    atime?: Date,
    mtime?: Date,
    ctime?: Date,
    birthtime?: Date
  ) => Stats;
};

const getFsStatics = (): FSStatics => {
  const fsModule = BFSRequire("fs") as FSModule & {
    FileType: FSStatics["FileType"];
    Stats: FSStatics["Stats"];
  };

  return {
    FileType: { ...fsModule.FileType },
    Stats: fsModule.Stats,
  };
};

export type EmscriptenFS = {
  DB_NAME: () => string;
  DB_STORE_NAME: string;
};

export type ExtendedEmscriptenFileSystem = Omit<EmscriptenFileSystem, "_FS"> & {
  _FS?: EmscriptenFS;
};

export type Mount = {
  _data?: Buffer;
  data?: Buffer;
  getName: () => string;
};

export type RootFileSystem = Omit<
  MountableFileSystem,
  "mntMap" | "mountList"
> & {
  mntMap: Record<string, Mount>;
  mountList: string[];
};

type AsyncFSModule = AsyncFS & {
  fs?: FSModule;
  rootFs?: RootFileSystem;
};

type FsQueueCall = [string, unknown[]];

const mockFsCallQueue: FsQueueCall[] = [];

const runQueuedFsCalls = (fs: FSModule): void => {
  if (mockFsCallQueue.length > 0) {
    const [name, args] = mockFsCallQueue.shift() as FsQueueCall;

    if (name in fs) {
      const fsCall = fs[name as keyof FSModule];

      if (typeof fsCall === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-call
        (fsCall as unknown as Function)(...args);
      }
    }

    runQueuedFsCalls(fs);
  }
};

const useAsyncFs = (): AsyncFSModule => {
  const [fs, setFs] = useState<FSModule>();
  const fsRef = useRef<FSModule>(undefined);
  const [rootFs, setRootFs] = useState<RootFileSystem>();
  const asyncFs: AsyncFS = useMemo(
    () => ({
      exists: (path) =>
        new Promise((resolve) => {
          fs?.exists(path, resolve);
        }),
      lstat: (path) =>
        new Promise((resolve, reject) => {
          fs?.lstat(path, (error, stats = Object.create(null) as Stats) =>
            error ? reject(error) : resolve(stats)
          );
        }),
      mkdir: (path, overwrite = false) =>
        new Promise((resolve, reject) => {
          fs?.mkdir(path, { flag: overwrite ? "w" : "wx" }, (error) =>
            error ? reject(error) : resolve(true)
          );
        }),
      readFile: (path) =>
        new Promise((resolve, reject) => {
          fs?.readFile(path, (error, data = Buffer.from("")) => {
            if (
              !error ||
              ((error as FSError)?.code &&
                UNKNOWN_STATE_CODES.has((error as FSError).code))
            ) {
              return resolve(data);
            }

            if ((error as FSError)?.code === "EISDIR" && rootFs?.mntMap[path]) {
              const mountData =
                rootFs.mntMap[path]._data || rootFs.mntMap[path].data;

              if (mountData) return resolve(mountData);
            }

            return reject(error);
          });
        }),
      readdir: (path) =>
        new Promise((resolve, reject) => {
          fs?.readdir(path, (error, data = []) =>
            error ? reject(error) : resolve(data)
          );
        }),
      rename: (oldPath, newPath) =>
        new Promise((resolve, reject) => {
          fs?.rename(oldPath, newPath, (error) => {
            if (!error) {
              resolve(true);
            } else if ((error as FSError).code === "ENOTSUP") {
              fs.lstat(
                oldPath,
                (_statsError, stats = Object.create(null) as Stats) => {
                  if (
                    stats &&
                    typeof stats.isDirectory === "function" &&
                    stats.isDirectory()
                  ) {
                    reject(new Error("Renaming directories is not supported."));
                  } else {
                    fs.readFile(oldPath, (readError, data) =>
                      fs.writeFile(newPath, data, (writeError) =>
                        readError || writeError
                          ? reject(
                              readError ||
                                writeError ||
                                new Error("Failed to rename file.")
                            )
                          : resolve(false)
                      )
                    );
                  }
                }
              );
            } else if ((error as FSError).code === "EISDIR") {
              rootFs?.umount(oldPath);
              asyncFs.rename(oldPath, newPath).then(resolve, reject);
            } else if (UNKNOWN_STATE_CODES.has((error as FSError).code)) {
              resolve(false);
            } else {
              reject(error);
            }
          });
        }),
      rmdir: (path) =>
        new Promise((resolve, reject) => {
          fs?.rmdir(path, (error) => (error ? reject(error) : resolve(true)));
        }),
      stat: (path) =>
        new Promise((resolve, reject) => {
          fs?.stat(path, (error, stats = Object.create(null) as Stats) => {
            if (error) {
              if (UNKNOWN_STATE_CODES.has((error as FSError).code)) {
                const { Stats: BfsStats, FileType } = getFsStatics();
                return resolve(new BfsStats(FileType.FILE, -1));
              }

              return reject(error);
            }

            if (stats.size === -1 && isExistingFile(stats)) {
              const { Stats: BfsStats, FileType } = getFsStatics();
              return resolve(
                new BfsStats(
                  FileType.FILE,
                  get9pSize(path),
                  stats.mode,
                  stats.atime,
                  stats.mtime,
                  stats.ctime,
                  stats.birthtime
                )
              );
            }

            return resolve(stats);
          });
        }),
      unlink: (path) =>
        new Promise((resolve, reject) => {
          fs?.unlink(path, (error) => {
            if (error) {
              const fsError = error as FSError;
              return UNKNOWN_STATE_CODES.has(fsError.code)
                ? resolve(false)
                : reject(new Error(error.message));
            }

            return resolve(true);
          });
        }),
      writeFile: (path, data, overwrite = false) =>
        new Promise((resolve, reject) => {
          (
            fs?.writeFile as unknown as (
              filePath: string,
              fileData: string | Buffer,
              options: { flag: string },
              callback: (error: FSError | null) => void
            ) => void
          )?.(path, data, { flag: overwrite ? "w" : "wx" }, (error) => {
            if (error && (!overwrite || error.code !== "EEXIST")) {
              if (error.code === "ENOENT" && error.path === "/") {
                import("contexts/fileSystem/functions").then(
                  ({ resetStorage }) =>
                    resetStorage(rootFs).finally(() => window.location.reload())
                );
              }

              reject(new Error(error.message));
            } else {
              resolve(!error);

              try {
                if (path !== SESSION_FILE) {
                  const cachedIconPath = join(
                    ICON_CACHE,
                    `${path}${ICON_CACHE_EXTENSION}`
                  );

                  fs?.exists(
                    cachedIconPath,
                    (exists) => exists && fs?.unlink(cachedIconPath)
                  );
                }
              } catch {
                // Ignore icon cache issues
              }
            }
          });
        }),
    }),
    [fs, rootFs]
  );

  useEffect(() => {
    if (!fs) {
      const queueFsCall =
        (name: string) =>
        (...args: unknown[]) => {
          if (fsRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-call
            (fsRef.current[name as keyof FSModule] as unknown as Function)(
              ...args
            );
          } else mockFsCallQueue.push([name, args]);
        };

      setFs({
        exists: queueFsCall("exists"),
        lstat: queueFsCall("lstat"),
        mkdir: queueFsCall("mkdir"),
        readFile: queueFsCall("readFile"),
        readdir: queueFsCall("readdir"),
        rename: queueFsCall("rename"),
        rmdir: queueFsCall("rmdir"),
        stat: queueFsCall("stat"),
        unlink: queueFsCall("unlink"),
        writeFile: queueFsCall("writeFile"),
      } as Partial<FSModule> as FSModule);
    } else if ("getRootFS" in fs) {
      runQueuedFsCalls(fs);
    } else {
      const setupFs = (writeToIndexedDB: boolean): void =>
        configure(FileSystemConfig(!writeToIndexedDB), () => {
          const loadedFs = BFSRequire("fs") as unknown as FSModule & {
            getRootFS: () => RootFileSystem;
          };

          fsRef.current = loadedFs;
          setFs(loadedFs);
          const loadedRoot = loadedFs.getRootFS() as RootFileSystem;
          if (loadedRoot) {
            setRootFs(loadedRoot);
          }
        });

      supportsIndexedDB().then(setupFs);
    }
  }, [fs]);

  return useMemo(
    () => ({
      ...asyncFs,
      fs,
      rootFs,
    }),
    [asyncFs, fs, rootFs]
  );
};

export default useAsyncFs;
