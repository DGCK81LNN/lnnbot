import { Context, segment } from "koishi"
import fetch from "node-fetch"

export const name = "lnnbot-derpi"
export interface Config {
  filter_id?: number,
}
export function apply(cxt: Context, config: Config = { }) {
  cxt
    .command("derpi", ">>0")
    .action(() => {
      return ">>0\n" + segment("image", { url: "https://derpicdn.net/img/2012/1/2/0/thumb.jpg" })
    })
}
