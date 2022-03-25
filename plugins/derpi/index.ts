import { Argv, Context, Logger, Session, segment } from "koishi"
import { getRandomImage, LoadedImage, loadImage } from "./api"
import ErrorWrapper from "../error-wrapper"

export const name = "lnnbot-derpi"
export interface Config {
  filter_id?: number
}

export const defaultConfig: Config = {
  filter_id: 191275,
}

export type DerpiRating = "s" | "su" | "q" | "e"

declare module "koishi" {
  namespace Argv {
    interface Domain {
      derpiRating: DerpiRating
    }
  }
}

async function sendImage(
  session: Session,
  logger: Logger,
  promise: Promise<LoadedImage>
) {
  let holdOnHandle = setTimeout(() => { session.send(session.text(".hold-on")) }, 1000)

  try {
    var { id, outPath } = await promise
  } catch (err) {
    if (err instanceof ErrorWrapper) {
      if (err.error) logger.warn(err.error)
      return session.text(...err.message)
    }
    logger.error(err)
    return session.text("internal.error-encountered")
  }

  clearTimeout(holdOnHandle)

  return (
    segment("image", { url: `file:///${outPath.replace(/^\//, "")}` }) +
    `\nhttps://derpibooru.org/images/${id}`
  )
}

export function apply(ctx: Context, config: Config = {}) {
  const logger = ctx.logger("lnnbot-derpi")
  config = Object.assign({}, defaultConfig, config)

  ctx
    .command("derpi <id:natural>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .action(({ session }, id) => sendImage(session, logger, loadImage(id)))

  Argv.createDomain("derpiRating", str => {
    if ("safe".startsWith(str)) return "s"
    if ("suggestive".startsWith(str)) return "su"
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
    .shortcut("随机暮暮图", { args: ["ts,pony,solo"] })
    .action(({ session, options: { rating } }, query) => {
      var ratingTags = ["wilson_score.gte:0.93"]
      switch (rating) {
        case "s":
          ratingTags.push("safe")
          break
        case "su":
          ratingTags.push("-questionable") // fallthrough
        case "q":
          ratingTags.push("-explicit") // fallthrough
        default:
          ratingTags.push("-semi-grimdark", "-grimdark", "-grotesque")
      }
      query += "," + ratingTags.join(",")
      return sendImage(session, logger, getRandomImage({
        filter_id: config.filter_id,
        q: query,
      }))
    })

  ctx.i18n.define("zh", "commands.derpi", {
    description: "获取呆站图片",
    messages: {
      "metadata-error": "加载图片信息失败。",
      "image-error": "加载图片失败。",
      "is-removed": "该图片已被删除。",
      "is-video": "不支持获取视频。",
      "hold-on": "请稍候，正在获取……",
    },
  })
  ctx.i18n.define("zh", "commands.derpi.random", {
    description: "随机获取呆站图片",
    options: {
      rating: "最高允许的年龄分级",
    },
    messages: {
      "metadata-error": "搜索图片失败。",
      "image-error": "加载图片失败。",
      "no-result": "没有找到符合条件的图片。",
      "hold-on": "请稍候，正在获取……",
    },
  })
}
