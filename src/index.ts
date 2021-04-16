import { App, User } from "koishi";
import "koishi-adapter-onebot";
import * as PluginCommon from "koishi-plugin-common";

const app = new App({
    port: 8080,
    nickname: "LNNBot", // Hey, Siri
    onebot: { secret: "LlLlSoul" },
    bots: [{
        type: "onebot:ws",
        server: "ws://localhost:6700",
        selfId: "2748080608",
        token: "SoulLlLl",
    }],
});

app.plugin(PluginCommon, {
    respondent: [
        { match: /\S(\s+\S)+/, reply: "foo" },
    ],
    onRepeat: { minTimes: 3 },
    /*onInterrupt: (state) => (
        state.repeated &&
        state.times >= 2 &&
        Math.random() > 0.5 &&
        "N" + "o".repeat(state.times) + "!"
    ),*/
    onFriendRequest: true,
    onGroupMemberRequest: async (session) => {
        var returnValue = undefined;
        if (
            session.channelId === "773864545" &&
            session.content
                .match(/答案：\s*(.+)\s*$/)[1]
                .match(/^(?:(?:小马|音游)向?|双厨)$/)
        )
            returnValue = true;

        session.send(
            `收到加群申请，验证消息：\n` +
            session.content.replace(/^/mg, "> ") + "\n" +
            `已${returnValue ? "同意" : "忽略"}。`
        );
        return returnValue;
    }
});

app.start();
