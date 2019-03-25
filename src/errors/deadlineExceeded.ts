import { CustomError } from 'ts-custom-error'

export default class DeadlineExceededError extends CustomError {
  constructor(public deadline: Date) {
    super('Context\'s deadline has been exceeded')
    this.name = 'DeadlineExceededError'
  }
}
