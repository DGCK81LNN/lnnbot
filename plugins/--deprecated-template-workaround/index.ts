import { Context, template } from "koishi"
import strings from "./templates.json"

export const name = "lnnbot---deprecated-template-workaround"
export type Config = void
export function apply(cxt: Context, _: Config) {
  cxt.once("ready", () => {
    for (let key in strings) {
      template.set(key, strings[key])
    }
  })
}
