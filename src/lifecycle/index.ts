import { Context } from "koishi"

export const name = "lnnbot-lifecycle"
export type Config = {
  notifyOnOnline?: string[],
  notifyBeforeExit?: string[],
}
export function apply(cxt: Context, config?: Config) {
  if (config?.notifyOnOnline) {
    let rm = cxt.on("bot-status-updated", bot => {
      if (bot.status === "online") {
        rm()
        bot.broadcast(config.notifyOnOnline, "机器人开机")
      }
    })
  }

  cxt.command("exit [status:number]", "关机", {
      authority: 4,
    })
    .action(async ({ session: { bot } }, status = 0) => {
      if (config?.notifyBeforeExit) {
        bot.broadcast(config.notifyBeforeExit, "机器人关机")
      }
      await cxt.app.stop()
      process.exit(status)
    })
}
