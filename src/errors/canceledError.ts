import { CustomError } from 'ts-custom-error'

export default class CanceledError extends CustomError {
  constructor() {
    super('Context has been canceled')
    this.name = 'CanceledError'
  }
}
