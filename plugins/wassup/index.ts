import { Context, Random, segment, Session } from "koishi"

export const name = "lnnbot-wassup"
export interface Config {
  acceptPokeMsgTypes: string[]
  callingKeywords: string[]
}

async function pickMessage(session: Session) {
  var { name } = await session.observeUser(["name"])

  let messages: string[] = []
  {
    let neutralMsgs = session.text("lnnbot.wassup.neutral")
    if (neutralMsgs) messages.push(...neutralMsgs.split("\0"))
  }
  if (name) {
    let namedMsgs = session.text("lnnbot.wassup.named", [name])
    if (namedMsgs) messages.push(...namedMsgs.split("\0"))
  }
  return Random.pick(messages)
}

function isWindowShake(session: Session) {
  return session.subtype === "private" && session.content === ""
}

const pokeMsgFormat = "[:type]请使用最新版手机QQ体验新功能。"
function isPoke(session: Session, acceptPokeMsgTypes: string[]) {
  let content = segment.unescape(session.content)
  return acceptPokeMsgTypes.some(type => content === pokeMsgFormat.replace(":type", type))
}

function isCalling(session: Session, callingKeywords: string[]) {
  if (!(session.subtype === "private" || session.parsed.appel)) return false
  var content = session.parsed.content
  return callingKeywords.some(keyword => content.startsWith(keyword))
}

export const defaultConfig: Config = {
  acceptPokeMsgTypes: ["戳一戳", "放大招", "勾引", "敲门"],
  callingKeywords: ["在吗", "在线吗", "出来", "人呢"],
}

export function apply(ctx: Context, config?: Partial<Config>) {
  config = Object.assign({}, defaultConfig, config)

  var pokeTimesMap = new Map<string, number>()

  ctx.on("notice/poke", async session => {
    if (session.guildId && session.targetId && session.targetId !== session.selfId) return

    var times = (pokeTimesMap.get(session.cid) || 0) + 1
    pokeTimesMap.set(session.cid, times)

    // 戳自己目前只在群内有效
    let pokeSelfProb = session.guildId && times > 6 ? 0.4 - 1 / (times - 3.5) : 0
    let pokeOtherProb = times > 2 ? 0.8 - 1 / (times - 0.75) : 0
    let rand = Math.random()

    if (rand < pokeSelfProb) await session.send(segment("poke", { qq: session.selfId }))
    else if (rand < pokeOtherProb) await session.send(segment("poke", { qq: session.userId }))
    else await session.send(await pickMessage(session))
  })

  ctx.middleware(async (session, next) => {
    if (ctx.bots.get(session.uid)) return
    pokeTimesMap.delete(session.cid)

    if (
      isWindowShake(session) ||
      isPoke(session, config.acceptPokeMsgTypes) ||
      isCalling(session, config.callingKeywords)
    )
      return await pickMessage(session)
    if (session.parsed.appel) return next(async () => await pickMessage(session))
    return next()
  })
}
