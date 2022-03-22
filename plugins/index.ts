import { Context } from "koishi"
import * as Derpi from "./derpi"
import * as Wassup from "./wassup"
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
}
