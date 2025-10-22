import { type FileSystemConfiguration } from "browserfs";
import { fs9pToBfs } from "contexts/fileSystem/core";

const index = fs9pToBfs();

const FileSystemConfig = (writeToMemory = false): FileSystemConfiguration => {
  console.log("🔧 FileSystemConfig called with writeToMemory:", writeToMemory);
  console.log("🔧 Index data:", index);
  
  const config = {
    fs: "MountableFileSystem",
    options: {
      "/": {
        fs: "OverlayFS",
        options: {
          readable: {
            fs: "HTTPRequest",
            options: { index },
          },
          writable: {
            fs: writeToMemory ? "InMemory" : "IndexedDB",
          },
        },
      },
    },
  };
  
  console.log("🔧 Generated config:", config);
  return config;
};

export default FileSystemConfig;
