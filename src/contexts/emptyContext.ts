import { Context } from '../types'
import CanceledError from '@/errors/canceledError'
import DeadlineExceededError from '@/errors/deadlineExceeded'

export default class EmptyContext implements Context {
  constructor(private name: string = 'UNKNOWN') { }
  deadline(): Date | null {
    return null
  }
  done(): Promise<void> | null {
    return null
  }
  err(): CanceledError | DeadlineExceededError | null {
    return null
  }
  value(key: any) {
    return undefined
  }
  toString(): string {
    return `context.${this.name}`
  }
}
