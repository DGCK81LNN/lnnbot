import { Context } from "koishi"
import * as Derpi from "./derpi"
import * as Wassup from "./wassup"
import * as deprecatedTemplateWorkaround from "./--deprecated-template-workaround"
export const name = "lnnbot"
export type Config = {
  derpi?: Derpi.Config,
  wassup?: Wassup.Config,
}
export function apply(
  cxt: Context,
  config?: Config,
) {
  cxt.plugin(Derpi, config?.derpi)
  cxt.plugin(Wassup, config?.wassup)
  cxt.plugin(deprecatedTemplateWorkaround)
}
