#! /usr/bin/env ts-node
import { App, Session, segment, template } from "koishi"
import { resolve as pathResolve } from "path"
import * as LNNBot from "./src/index"

const app = new App({
  port: 8080,
  nickname: ["LNNBot", "lnnbot"],
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
app.plugin("broadcast")
app.plugin("callme")
app.plugin("echo")
app.plugin("recall")
app.plugin("repeater", {
  onRepeat: ({ times, content }: { times: number, content: string }) => {
    if (times >= 3) {
      if (Math.random() < 1 / Math.log(times)) {
        if (Math.random() < 1 / (times - 2))
          return content
      } else {
        return segment("image", {
          url: `file://${pathResolve("./lnnbot_assets/noplusone.jpg")}`
        })
      }
    }
  },
})
app.plugin("respondent", [{ match: /lnnbot\?/i, reply: "啦啦啦" }])
app.plugin("schedule")
app.plugin("switch")
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

template.set('internal', {
  'low-authority': '不行不行，你的权限不够呢……（？',
  'insufficient-arguments': '你给的参数不够呢，要不看看帮助……？',
  'redundant-arguments': '你给的参数太多了呢，要不看看帮助……？',
  'invalid-argument': '你给的 {0} 参数有点问题，{1}',
  'unknown-option': '额，好像没有 {0} 这个选项呢，要不看看帮助……？',
  'invalid-option': '你给的 {0} 选项有点问题，{1}',
  'check-syntax': '额，我没看懂，要不你看看帮助……？',
  'invalid-number': '应该是个数字呢。',
  'invalid-integer': '应该是个整数呢。',
  'invalid-posint': '应该是个正整数呢。',
  'invalid-natural': '应该是个自然数呢。',
  'invalid-date': '应该是个时刻呢。',
  'invalid-user': '应该是个用户ID呢。',
  'invalid-channel': '应该是个群ID呢。',
  'suggestion': '你说的是不是 {0} 啊……？',
  'command-suggestion-prefix': '',
  'command-suggestion-suffix': '是的话就发个句号吧。',
  'help-suggestion-prefix': '额，好像没有这个指令呢。',
  'help-suggestion-suffix': '是的话就发个句号吧。',
  'subcommand-prolog': '可用的子指令有这些：{0}',
  'global-help-prolog': '嗯嗯，可用的指令有：{0}',
  'global-help-epilog': '要看某个指令的详细用法的话，就输入“帮助 指令名”吧。',
  'available-options': '可用的选项有这些：',
  'available-options-with-authority': '可用的选项有这些：（括号内是额外要求的权限等级）',
  'hint-authority': '括号里是需要的权限等级',
  'hint-subcommand': '标星号的指令还有子指令',
  'command-alias': '输入 {0} 也可以使用这个指令。',
  'command-examples': '比如你可以这样用，',
  'command-authority': '需要 {0} 极权限才能使用。',
})
template.set('common.error-encountered', '诶……？出错了……')
template.set('admin', {
  'user-not-found': '我好像没有见过这个用户呢……',
  'user-unchanged': '不用改了，已经是这样了呢。',
  'user-updated': '嗯嗯，改好了。',
  'channel-not-found': '我好像不知道这个群呢……',
  'channel-unchanged': '不用改了，已经是这样了呢。',
  'channel-updated': '嗯嗯，改好了。',
  'not-in-group': '额，不知道你说的是哪个群啊……？',
  'unknown-flag': '好像没有 {0} 这个标记呢。',
  'all-flags': '标记有这些：{0}。',
  'no-flags': '一个标记都没有呢。',
  'current-flags': '当前的标记是 {0}。',
  'user-expected': '额……你要设置的用户是谁啊？',
  'invalid-assignee-platform': '啊……？机器人只能代理同一个平台上的群哦……',
})
template.set('broadcast.expect-text', '额，你让我说的是什么啊……？')
template.set('callme', {
  'current': '你好呀，{0}！',
  'unnamed': '额，不知道你叫什么名字啊……？',
  'unchanged': '嗯，我已经知道你叫这个名字了呢。',
  'empty': '额，我没听清，你叫什么……？',
  'invalid': '啊……？我没听懂……',
  'duplicate': '额……这……不对吧，你也叫这个名字？',
  'updated': '嗯嗯，{0}，我记住了！',
  'failed': '诶……？出错了……',
})
template.set('echo', {
  'expect-text': '额，你让我说的是什么啊……？',
  'platform-not-found': '我好像没有这个平台的账户呢……',
})
template.set('switch', {
  'forbdden': '不行不行，你不能修改 {0} 功能……',
  'list': '现在关掉了的功能有这些：{0}',
  'none': '现在所有功能都开着呢。',
})
template.set('teach', {
  'too-many-arguments': '你给的参数太多了呢，检查一下吧。问答如果包含空格或换行，要记得加引号哦。',
  'missing-question-or-answer': '你给的参数不全呢，检查一下吧。',
  'prohibited-command': '不可以在回答里用 {0} 指令哦。',
  'prohibited-cq-code': '啊……？问题只能是纯文本哦。',
  'illegal-regexp': '啊……？你给的正则表达式我看不懂……',
  'probable-modify-answer': '额，你要修改的是不是回答啊？要修改回答的话就发个句号，如果确实要修改问题就加上 -I 选项吧。',
  'probable-regexp': '额，你要{0}的问题是不是正则表达式啊？要{0}正则的话就发个句号，如果确实不是正则就加上 -I 选项吧。',
})
template.set('lnnbot-lifecycle', {
  'on-online': '开机了~',
  'before-exit': '关机了~',
})

app.start()
