import { Session } from "koishi"

export default interface ErrorWrapper {
  error: Error
  message: Parameters<typeof Session.prototype.text>
}
