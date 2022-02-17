import { Context } from "koishi"
import * as Lifecycle from "./lifecycle"
import * as Derpi from "./derpi"
export const name = "lnnbot"
export function apply(
  cxt: Context,
  config?: {
    lifecycle?: Lifecycle.Config,
    derpi?: Derpi.Config,
  },
) {
  cxt.plugin(Lifecycle, config?.lifecycle)
  cxt.plugin(Derpi, config?.derpi)
}
