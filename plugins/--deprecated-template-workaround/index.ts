import { Context, template } from "koishi"
import strings from "./templates.json"

export const name = "lnnbot---deprecated-template-workaround"
export function apply(cxt: Context, _config?: {}) {
  cxt.once("ready", () => {
    for (let key in strings) {
      template.set(key, strings[key])
    }
  })
}
