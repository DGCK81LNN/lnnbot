import { Context, Session, segment } from "koishi"
import fs from "fs"
import Stream from "stream"
import path from "path"
import axios from "axios"

export const name = "lnnbot-derpi"
export interface Config {
  filter_id?: number
}

async function loadImage(session: Session, id: number, outPath: string) {
  try {
    await fs.promises.lstat(outPath)
    return
  } catch {}

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })

  try {
    var metaResponse = await axios.get(`https://derpibooru.org/api/v1/json/images/${id}`)
  } catch (err) {
    throw session.text(".metadata-error")
  }
  var meta = metaResponse.data.image

  try {
    var imgResponse = await axios.get(meta.representations["small"], {
      responseType: "stream",
    })
  } catch (err) {
    throw session.text(".image-error")
  }

  var imgStream = imgResponse.data
  await Stream.promises.pipeline(imgStream, fs.createWriteStream(outPath))
}

export function apply(ctx: Context, config: Config = {}) {
  ctx
    .command("derpi <id:natural>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .action(async ({ session }, id) => {
      var outPath = path.resolve(`./.lnnbot_cache/${id}`).replace(/^\//, "")

      try {
        await loadImage(session, id, outPath)
      } catch (err) {
        if (typeof err === "string") return err
        throw err
      }

      return (
        segment("image", { url: `file:///${outPath}` }) +
        `\nhttps://derpibooru.org/images/${id}`
      )
    })

  ctx.i18n.define("zh", "commands.derpi", {
    description: "获取呆站图片",
    messages: {
      "metadata-error": "加载图片信息失败。",
      "image-error": "加载图片失败。",
    },
  })
}
