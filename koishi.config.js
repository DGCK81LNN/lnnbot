module.exports = {
    port: 8080,
    onebot: {
        secret: 'LlLlSoul',
    },
    bots: [{
        type: 'onebot:ws',
        server: 'ws://localhost:6700',
        selfId: 2748080608,
        token: 'SoulLlLl',
    }],
    plugins: {
        "common": {},
        "./bin/demo-plugin": {}
    },
}