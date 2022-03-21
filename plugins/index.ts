import { Context } from "koishi"
import * as Derpi from "./derpi"
export const name = "lnnbot"
export function apply(
  cxt: Context,
  config?: {
    derpi?: Derpi.Config,
  },
) {
  cxt.plugin(Derpi, config?.derpi)
}
