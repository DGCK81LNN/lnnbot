#! /usr/bin/env ts-node
import { App, Session } from "koishi"
import * as LNNBot from "./src/index"

const app = new App({
  port: 8080,
  nickname: "LNNBot",
  autoAuthorize: ses => {
    if ((ses as any).userId === '3470524928') return 4
    return 1
  },
})

app.plugin("adapter-onebot", {
  secret: "LlLlSoul",
  token: "SoulLlLl",
  endpoint: "ws://localhost:6700",
  selfId: "2748080608",
})

app.plugin("database-memory", { storage: true })

app.plugin("admin")
app.plugin("callme")
app.plugin("echo")
app.plugin("recall")
app.plugin("repeater", {
  onRepeat: { minTimes: 3 },
})
app.plugin("respondent", [{ match: /lnnbot/i, reply: "啦啦啦" }])
app.plugin("schedule")
app.plugin("teach")
app.plugin("verifier", {
  onFriendRequest: true,
  onGuildMemberRequest: async (session: Session) => {
    var returnValue = undefined
    if (
      session.channelId === "773864545" &&
      session.content.match(/答案：\s*(.+)\s*$/)[1].match(/小马|音游|双厨/)
    )
      returnValue = true

    session.send(
      `收到加群申请：\n` +
        session.content.replace(/^/gm, "> ") +
        "\n" +
        `已${returnValue ? "同意" : "忽略"}。`
    )
    return returnValue
  },
})
app.plugin(LNNBot, {
  lifecycle: {
    notifyOnOnline: ["private:3470524928"],
    notifyBeforeExit: ["private:3470524928"],
  },
})

app.start()
