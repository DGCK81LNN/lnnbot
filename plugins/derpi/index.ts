import { Context, segment, Argv } from "koishi"
import ErrorWrapper from "../error-wrapper"
import fs from "fs"
import Stream from "stream"
import path from "path"
import axios from "axios"

export const name = "lnnbot-derpi"
export interface Config {
  filter_id?: number
}

export type DerpiRating = "s" | "u" | "q" | "e"

declare module "koishi" {
  namespace Argv {
    interface Domain {
      derpiRating: DerpiRating
    }
  }
}

async function loadImage(id: number, outPath: string): Promise<ErrorWrapper | void> {
  try {
    await fs.promises.lstat(outPath)
    return
  } catch {}

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })

  try {
    var metaResponse = await axios.get(`https://derpibooru.org/api/v1/json/images/${id}`)
  } catch (err) {
    return { message: [".metadata-error"], error: err }
  }
  var meta = metaResponse.data.image

  try {
    var imgResponse = await axios.get(meta.representations["small"], {
      responseType: "stream",
    })
  } catch (err) {
    return { message: [".image-error"], error: err }
  }

  var imgStream = imgResponse.data
  await Stream.promises.pipeline(imgStream, fs.createWriteStream(outPath))
}

export function apply(ctx: Context, config: Config = {}) {
  const logger = ctx.logger("lnnbot-derpi")

  ctx
    .command("derpi <id:natural>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .action(async ({ session }, id) => {
      var outPath = path.resolve(`./.lnnbot_cache/${id}`).replace(/^\//, "")

      try {
        var err = await loadImage(id, outPath)
      } catch (err) {
        logger.error(err)
        return session.text("internal.error-encountered")
      }
      if (err) {
        logger.warn(err.error)
        return session.text(...err.message)
      }

      return (
        segment("image", { url: `file:///${outPath}` }) +
        `\nhttps://derpibooru.org/images/${id}`
      )
    })

  Argv.createDomain("derpiRating", str => {
    if ("safe".startsWith(str)) return "s"
    if ("suggestive".startsWith(str)) return "u"
    if ("questionable".startsWith(str)) return "q"
    if ("explicit".startsWith(str)) return "e"
    throw "invalid rating"
  })

  ctx
    .command("derpi.random <query:text>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .option("rating", "-r <rating:derpiRating>", { fallback: "s" })
    .shortcut("随机小马图", {})
    .action(async argv => {
      console.dir(argv)
    })

  ctx.i18n.define("zh", "commands.derpi", {
    description: "获取呆站图片",
    messages: {
      "metadata-error": "加载图片信息失败。",
      "image-error": "加载图片失败。",
    },
  })
}
