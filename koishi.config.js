const { segment } = require("koishi")
const { toFileURL } = require("./plugins/utils")

require("yaml-register").register() // XD

/** @type {import("koishi").Config & { plugins: { [s: string]: any } }} */
module.exports = {
  port: 8080,
  nickname: ["LNNBot", "lnnbot"],
  autoAuthorize: 1,
  exitCommand: true,
  locale: "$souls",
  plugins: {
    /** @type {import("@koishijs/plugin-adapter-onebot").BotConfig} */
    "adapter-onebot": {
      endpoint: "ws://localhost:6700",
      selfId: "2748080608",
    },
    "admin": {},
    "broadcast": {},
    "callme": {},
    /** @type {import("@koishijs/plugin-database-memory/lib/storage").Config} */
    "database-memory": {
      storage: true,
    },
    "echo": {},
    "locales": {},
    "recall": {},
    /** @type {import("@koishijs/plugin-repeater").Config} */
    "repeater": {
      onRepeat: ({ times, content }) => {
        if (times === 2 && Math.random() < 0.0646) return content
        if (times >= 3) {
          let rand = Math.random()
          if (rand < 1 / (times - 2)) {
            return content
          } else if (rand >= 1 / times + 0.75) {
            return segment("image", {
              url: toFileURL("./assets/noplusone.jpg"),
              subType: 1,
            })
          }
        }
      },
    },
    /** @type {import("@koishijs/plugin-respondent").Config} */
    "respondent": [
      { match: /lnnbot\?/i, reply: "啦啦啦" },
    ],
    "schedule": {},
    "sudo": {},
    "switch": {},
    "teach": {},
    /** @type {import("@koishijs/plugin-verifier").Config} */
    "verifier": {
      onFriendRequest: true,
      onGuildMemberRequest: async session => {
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
    },
    "./plugins/--deprecated-template-workaround": {},
    "./plugins/derpi": {},
    "./plugins/wassup": {},
  },
}
