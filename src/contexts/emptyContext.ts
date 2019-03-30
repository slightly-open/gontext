import { Context } from '../types'
import CanceledError from '@/errors/canceledError'
import DeadlineExceededError from '@/errors/deadlineExceeded'

export default class EmptyContext implements Context {
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
    if (this === backgroundCtx) {
      return 'context.background'
    }
    if (this === todoCtx) {
      return 'context.TODO'
    }
    return 'unknown empty Context'
  }
}

export const backgroundCtx = new EmptyContext()
export const todoCtx = new EmptyContext()
