import { Session } from "koishi"

export type ErrorMessage = Parameters<typeof Session.prototype.text>

export default class ErrorWrapper {
  message: ErrorMessage
  error?: Error
  constructor(message: ErrorMessage, error?: Error) {
    this.message = message
    this.error = error
  }
}
