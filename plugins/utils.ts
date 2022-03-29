import path from "path"

export function toFileURL(...p: string[]) {
  return `file:///${path.resolve(...p).replace(/^\//, "")}`
}
