import { Context } from "koishi"
import * as Lifecycle from "./lifecycle"
export const name = "lnnbot"
export function apply(
  cxt: Context,
  config?: {
    lifecycle?: Lifecycle.Config,
  },
) {
  cxt.plugin(Lifecycle, config?.lifecycle)
}
