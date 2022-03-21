import { Context, segment } from "koishi"
import fs from "fs"
import Stream from "stream"
import path from "path"
import axios from "axios"

export const name = "lnnbot-derpi"
export interface Config {
  filter_id?: number,
}
export function apply(cxt: Context, config: Config = { }) {
  cxt
    .command("derpi <id:natural>", "获取呆站图片")
    .action(async (_argv, id) => {
      var outPath = path.resolve(`./.lnnbot_cache/${id}`)

      try {
        await fs.promises.lstat(outPath)
      } catch { // not cached
        await fs.promises.mkdir(path.dirname(outPath), { recursive: true })

        var metadata = (await axios.get(`https://derpibooru.org/api/v1/json/images/${id}`)).data.image

        var stream = (await axios.get(metadata.representations["small"], {
          responseType: "stream",
        })).data

        await Stream.promises.pipeline(stream, fs.createWriteStream(outPath))
      }

      return `>>${id}\n` + segment("image", { url: `file://${outPath}` })
    })
}
