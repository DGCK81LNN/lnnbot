import { Context } from "koishi"
import { parsePlatform } from "@koishijs/helpers"

export const name = "tell"

export function apply(ctx: Context) {
  //ctx
    //.command("tell.test <user:user>")
    //.shortcut("测试", { fuzzy: true })
    //.action(({ args }) => JSON.stringify(args))

  ctx
    .command("tell <user:user> <message:text>", {
      authority: 3,
      checkArgCount: true,
      checkUnknown: true,
      showWarning: true,
    })
    .shortcut("告诉", { prefix: true, fuzzy: true })
    .shortcut("帮我告诉", { prefix: true, fuzzy: true })
    .shortcut("帮我转告", { prefix: true, fuzzy: true })
    .action(async ({ session }, targetUser, message) => {
      if (!message) return session.text(".expect-text")

      const [platform, id] = parsePlatform(targetUser)
      const bot = ctx.bots.find(bot => bot.platform === platform)
      if (!bot) return session.text(".platform-not-found")

      const { name } = await session.observeUser(["name"])
      const { name: targetName } = await session.getUser(id, ["name"])

      const transforms = session
        .text(".transform")
        .split("\n")
        .map(t => t.split("\t"))
      message = transforms.reduce(
        (prev, [reg, replacement]) => prev.replace(new RegExp(reg, "gi"), replacement),
        message
      )

      await bot.sendPrivateMessage(
        id,
        session.text(".retell", [targetName, name, message])
      )
    })

  ctx.i18n.define("zh", "commands.tell", {
    description: "转告另一用户",
    messages: {
      "expect-text": "请输入要发送的文本。",
      "platform-not-found": "找不到指定的平台。",
      "transform":
        "你\t\ufdd0\n我\t\ufdd1\n他\t你\n她\t你\n\\bta\\b\t你\n\\ufdd0\t我\n\\ufdd1\tta",
      "retell": "你好 {0}，{1} 让我转告你，{2}",
    },
  })
}
