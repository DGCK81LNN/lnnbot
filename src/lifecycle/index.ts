import { Context, template } from "koishi"

export const name = "lnnbot-lifecycle"

template.set(name, {
  "on-online": "机器人开机",
  "before-exit": "机器人关机",
})

export type Config = {
  notifyOnOnline?: string[],
  notifyBeforeExit?: string[],
}
export function apply(cxt: Context, config?: Config) {
  if (config?.notifyOnOnline) {
    let rm = cxt.on("bot-status-updated", bot => {
      if (bot.status === "online") {
        rm()
        bot.broadcast(config.notifyOnOnline, template("lnnbot-lifecycle.on-online"))
      }
    })
  }

  cxt.command("exit [status:integer]", "关机", { authority: 4 })
    .action(async ({ session: { bot } }, status = 0) => {
      if (config?.notifyBeforeExit) {
        bot.broadcast(config.notifyBeforeExit, template("lnnbot-lifecycle.before-exit"))
      }
      await cxt.app.stop()
      process.exit(status)
    })
}
