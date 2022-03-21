module.exports = {
  port: 8080,
  nickname: ["LNNBot", "lnnbot"],
  autoAuthorize: 1,
  exitCommand: true,
  plugins: {
    "adapter-onebot": {
      secret: "LlLlSoul",
      token: "SoulLlLl",
      endpoint: "ws://localhost:6700",
      selfId: "2748080608",
    },
    "admin": {},
    "broadcast": {},
    "callme": {},
    "database-memory": { storage: true },
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
    },
    "respondent": [{ match: /lnnbot\?/i, reply: "啦啦啦" }],
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
    },
    "./plugins": {
      derpi: {
      },
    }
  },
}
