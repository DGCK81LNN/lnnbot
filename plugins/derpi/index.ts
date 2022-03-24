import { Context, segment, Argv } from "koishi"
import { loadImage } from "./api"
import ErrorWrapper from "../error-wrapper"

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

export function apply(ctx: Context, config: Config = {}) {
  const logger = ctx.logger("lnnbot-derpi")

  ctx
    .command("derpi <id:natural>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .action(async ({ session }, id) => {
      try {
        var outPath = await loadImage(id)
      } catch (err) {
        if (err instanceof ErrorWrapper) {
          if (err.error) logger.warn(err.error)
          return session.text(...err.message)
        }
        logger.error(err)
        return session.text("internal.error-encountered")
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
      "is-removed": "该图片已被删除。",
      "is-video": "不支持获取视频。",
    },
  })
}
