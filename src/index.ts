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
});

app.start();
