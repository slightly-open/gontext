import { CustomError } from 'ts-custom-error'

export default class DeadlineExceededError extends CustomError {
  constructor() {
    super('Context\'s deadline has been exceeded')
    this.name = 'DeadlineExceededError'
  }
}
