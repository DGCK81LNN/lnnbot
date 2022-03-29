const { segment } = require("koishi")
const path = require("path")

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
        if (times >= 3) {
          if (Math.random() < 1 / Math.log(times)) {
            if (Math.random() < 1 / (times - 2)) return content
          } else {
            return segment("image", {
              url: `file://${path.resolve("./assets/noplusone.jpg")}`,
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
    },
    /** @type {import("./plugins").Config} */
    "./plugins": {
      derpi: {
      },
    },
  },
}
