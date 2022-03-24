import { Session } from "koishi"

export type ErrorMessage = Parameters<typeof Session.prototype.text>

export default class ErrorWrapper {
  error: Error
  message: ErrorMessage
  constructor(error: Error, message: ErrorMessage) {
    this.error = error
    this.message = message
  }
}
