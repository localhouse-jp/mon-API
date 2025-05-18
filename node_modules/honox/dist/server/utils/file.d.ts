declare const filePathToPath: (filePath: string) => string;
declare const groupByDirectory: <T = unknown>(files: Record<string, T>) => Record<string, Record<string, T>>;
declare const sortDirectoriesByDepth: <T>(directories: Record<string, T>) => Record<string, T>[];
declare const listByDirectory: <T = unknown>(files: Record<string, T>) => Record<string, string[]>;
declare const pathToDirectoryPath: (path: string) => string;

export { filePathToPath, groupByDirectory, listByDirectory, pathToDirectoryPath, sortDirectoriesByDepth };
