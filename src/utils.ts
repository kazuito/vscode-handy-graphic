export function genOutFilePath(outFilePath: string, fileInfo: FileInfo) {
  const keys = Object.keys(fileInfo);
  for (let key of keys) {
    const regexp = new RegExp(`\\\${${key}}`, "g");
    outFilePath = outFilePath.replace(regexp, fileInfo[key as keyof FileInfo]);
  }

  return outFilePath;
}
