import { App, segment } from "koishi"
import { resolve as pathResolve } from "path"

type AppConfig = App.Config & { plugins: { [s: string]: any } }
module.exports = {
  port: 8080,
  nickname: ["LNNBot", "lnnbot"],
  autoAuthorize: 1,
  exitCommand: true,
  locale: "$souls",
  plugins: {
    "adapter-onebot": {
      endpoint: "ws://localhost:6700",
      selfId: "2748080608",
    } as import("@koishijs/plugin-adapter-onebot").BotConfig,
    "admin": {},
    "broadcast": {},
    "callme": {},
    "database-memory": {
      storage: true,
    } as import("@koishijs/plugin-database-memory/lib/storage").Config,
    "echo": {},
    "locales": {},
    "recall": {},
    "repeater": {
      onRepeat: ({ times, content }) => {
        if (times >= 3) {
          if (Math.random() < 1 / Math.log(times)) {
            if (Math.random() < 1 / (times - 2)) return content
          } else {
            return segment("image", {
              url: `file://${pathResolve("./assets/noplusone.jpg")}`,
            })
          }
        }
      },
    } as import("@koishijs/plugin-repeater").Config,
    "respondent": [
      { match: /lnnbot\?/i, reply: "啦啦啦" },
    ] as import("@koishijs/plugin-respondent").Config,
    "schedule": {},
    "sudo": {},
    "switch": {},
    "teach": {},
    "verifier": {
      onFriendRequest: true,
      onGuildMemberRequest: async (session) => {
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
    } as import("@koishijs/plugin-verifier").Config,
    "./plugins": {
      derpi: {
      },
    } as import("./plugins").Config,
  },
} as AppConfig
