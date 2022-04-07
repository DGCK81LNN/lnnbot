import { Argv, Context, Session, Time, escapeRegExp, segment } from "koishi"
import { getRandomImage, LoadedImage, loadImage } from "./api"
import ErrorWrapper from "../error-wrapper"
import { toFileURL } from "../utils"

export const name = "lnnbot-derpi"
export interface Config {
  /** 获取图片时使用的过滤器编号，默认为 191275。 */
  filterId: number
  /** 收到请求后，延迟多长时间发送“请稍候”；单位为毫秒，默认为 5 秒。 */
  holdOnTime: number
  /** 在指定时间内，同一频道内如果已经请求过图片，则不再发送“请稍候”；单位为毫秒，默认为 5 分钟。 */
  omitHoldOnTimeout: number
  /**
   * 定义要注册的 `derpi.random` 指令快捷方式。
   *
   * 默认值：
   *
   * ~~~json
   * [
   *   { "name": "小马", "query": "pony" },
   *   { "name": ["暮暮", "紫悦", "TS"], "query": "ts,pony,solo" },
   *   { "name": ["萍琪", "碧琪", "PP"], "query": "pp,pony,solo" },
   *   { "name": ["阿杰", "嘉儿", "AJ"], "query": "aj,pony,solo" },
   *   { "name": ["柔柔", "小蝶", "FS"], "query": "fs,pony,solo" },
   *   { "name": ["云宝", "戴茜", "黛茜", "黛西", "RD"], "query": "rd,pony,solo" },
   *   { "name": ["瑞瑞", "珍奇", "RY"], "query": "ry,pony,solo" }
   * ]
   * ~~~
   */
  randomShortcuts: {
    /** 快捷方式的名称，如需要“随机小马图”则填写 `"小马"`。可以指定多个。 */
    name: string | string[]
    /** 对应的搜索词。 */
    query: string
    /** 对应的选项。 */
    options?: {
      /**
       * 指定最高可能出现的 R34 分级。
       *
       * `1` 表示性暗示，`2` 表示强烈性暗示，`3` 表示露骨性描写。默认为 `0`，表示全部不允许。
       */
      r34?: 0 | 1 | 2 | 3
      /**
       * 指定最高可能出现的黑暗内容分级。
       *
       * `1` 表示轻度黑暗，`2` 表示重度黑暗。默认为 `0`，表示全部不允许。
       */
      dark?: 0 | 1 | 2
      /** 指定是否可能出现血腥或恶心的图片 */
      grotesq?: boolean
    }
  }[]
}

export const defaultConfig: Config = {
  filterId: 191275,
  holdOnTime: 5 * Time.second,
  omitHoldOnTimeout: 5 * Time.minute,
  randomShortcuts: [
    { name: "小马", query: "pony" },
    { name: ["暮暮", "紫悦", "TS"], query: "ts,pony,solo" },
    { name: ["萍琪", "碧琪", "PP"], query: "pp,pony,solo" },
    { name: ["阿杰", "嘉儿", "AJ"], query: "aj,pony,solo" },
    { name: ["柔柔", "小蝶", "FS"], query: "fs,pony,solo" },
    { name: ["云宝", "戴茜", "黛茜", "黛西", "RD"], query: "rd,pony,solo" },
    { name: ["瑞瑞", "珍奇", "RY"], query: "ry,pony,solo" },
  ],
}

export type DerpiRating = "s" | "su" | "q" | "e"

declare module "koishi" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Argv {
    interface Domain {
      derpiRating: DerpiRating
    }
  }
}

export function apply(ctx: Context, config: Partial<Config> = {}) {
  const logger = ctx.logger("lnnbot-derpi")
  config = Object.assign({}, defaultConfig, config)

  /**
   * 记录各个频道最近一次获取图片的时间；若当前正在为该频道获取图片中，记为 `NaN`。
   */
  const lastInvokeTimeMap = new Map<string, number>()

  async function sendImage(session: Session, promise: Promise<LoadedImage>) {
    const lastInvokeTime = lastInvokeTimeMap.get(session.cid) ?? -Infinity
    if (isNaN(lastInvokeTime)) return session.text(".too-fast")
    lastInvokeTimeMap.set(session.cid, NaN)

    let holdOnHandle: NodeJS.Timeout | null = null
    const elapsedTime = Date.now() - lastInvokeTime
    if (elapsedTime > config.omitHoldOnTimeout)
      holdOnHandle = setTimeout(() => {
        session.send(session.text(".hold-on"))
      }, config.holdOnTime)

    let id: number
    let outPath: string
    try {
      ;({ id, outPath } = await promise)
    } catch (err) {
      if (err instanceof ErrorWrapper) {
        if (err.error) logger.warn(err.error)
        return session.text(...err.message)
      }
      logger.error(err)
      return session.text("internal.error-encountered")
    } finally {
      if (holdOnHandle !== null) clearTimeout(holdOnHandle)
      lastInvokeTimeMap.set(session.cid, Date.now())
    }

    return (
      segment("image", { url: toFileURL(outPath) }) +
      `\nhttps://derpibooru.org/images/${id}`
    )
  }

  const cmdDerpi = ctx.command("derpi <id:natural>", {
    checkArgCount: true,
    checkUnknown: true,
    showWarning: true,
  })
  cmdDerpi.action(({ session }, id) => {
    lastQueryMap.delete(session.cid)
    return sendImage(session, loadImage(id))
  })

  Argv.createDomain("derpiRating", str => {
    if ("safe".startsWith(str)) return "s"
    if ("suggestive".startsWith(str)) return "su"
    if ("questionable".startsWith(str)) return "q"
    if ("explicit".startsWith(str)) return "e"
    throw "invalid rating"
  })

  const cmdDerpiRandom = ctx
    .command("derpi.random <query:string>", {
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .option("r34", "<level:number>", { fallback: 0, hidden: true })
    .option("r34", "-s", { value: 1 })
    .option("r34", "-q", { value: 2 })
    .option("r34", "-e", { value: 3 })
    .option("dark", "<level:number>", { fallback: 0, hidden: true })
    .option("dark", "-S", { value: 1 })
    .option("dark", "-g", { value: 2 })
    .option("grotesq", "-G", { fallback: false, hidden: true })

  const randomShortcutsUsage = config.randomShortcuts.map(({ name, query, options }) => {
    const nameArr: string[] = typeof name === "string" ? [name] : name
    const namesRe = nameArr.map(n => escapeRegExp(n)).join("|")
    const regExp = new RegExp(`^随机(?:${namesRe})图$`, "i")
    cmdDerpiRandom.shortcut(regExp, { args: [query], options })

    return `随机${nameArr.join("/")}图`
  })

  cmdDerpiRandom
    .usage(
      session =>
        `${session.text("commands.derpi.random.messages.usage")}\n` +
        (randomShortcutsUsage.length
          ? `${session.text("commands.derpi.random.messages.usage-shortcuts")}\n` +
            randomShortcutsUsage.map(s => `    ${s}`).join("\n")
          : "")
    )
    .action(({ session, options: { r34, dark, grotesq } }, query) => {
      const restrictions = ["wilson_score.gte:0.93"]
      if (r34 || dark || grotesq) {
        switch (r34) {
          case 0:
            restrictions.push("-suggestive") // fallthrough
          case 1:
            restrictions.push("-questionable") // fallthrough
          case 2:
            restrictions.push("-explicit")
        }
        switch (dark) {
          case 0:
            restrictions.push("-semi-grimdark") // fallthrough
          case 1:
            restrictions.push("-grimdark")
        }
        if (!grotesq) restrictions.push("-grotesque")
      } else {
        restrictions.push("safe")
      }
      query = `(${query}),${restrictions.join(",")}`
      return sendImage(
        session,
        getRandomImage({
          filter_id: config.filterId,
          q: query,
        })
      )
    })

  ctx.i18n.define("zh", "commands.derpi", {
    description: "获取呆站图片",
    messages: {
      "metadata-error": "加载图片信息失败。",
      "image-error": "加载图片失败。",
      "is-removed": "该图片已被删除。",
      "is-video": "不支持获取视频。",
      "too-fast": "操作过于频繁，请等待上一张图片请求完成后再试。",
      "hold-on": "请稍候，正在获取……",
    },
  })
  ctx.i18n.define("zh", "commands.derpi.random", {
    description: "随机获取呆站图片",
    options: {
      r34: "指定最高可能出现的 R34 分级：--r34 1 或 -s 表示性暗示，--r34 2 或 -q 表示强烈性暗示，--r34 3 或 -e 表示露骨性描写",
      dark: "指定最高可能出现的黑暗内容分级：--dark 1 或 -S 表示轻度黑暗，--dark 2 或 -g 表示重度黑暗",
      grotesq: "若指定，则可能出现血腥或恶心的图片",
    },
    messages: {
      "usage":
        "输入 derpi.random，后加一个 Derpibooru 搜索串，用于筛选图片。若搜索串中有空格，需给整个搜索串加引号。",
      "usage-shortcuts": "也可以直接使用以下快捷方式来调用预设的搜索串和选项：",
      "metadata-error": "搜索图片失败。",
      "image-error": "加载图片失败。",
      "no-result": "没有找到符合条件的图片。",
      "too-fast": "操作过于频繁，请等待上一张图片请求完成后再试。",
      "hold-on": "请稍候，正在获取……",
    },
  })
}
