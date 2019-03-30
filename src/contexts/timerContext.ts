import { Context } from '@/types'
import { Canceler, removeChild } from '@/core'
import CanceledError from '@/errors/canceledError'
import DeadlineExceededError from '@/errors/deadlineExceeded'
import CancelContext from './cancelContext'

/**
 * A TimerContext carries a timeout id and a deadline.
 * It embeds a cancelContext to implement Done and Err.
 * It implements cancel by stopping its timer then
 * delegating to cancelCtx.cancel.
 */
export default class TimerContext implements Context, Canceler {
  public _timeoutId: number | null = null
  constructor (
    public _cancelContext: CancelContext,
    public _deadline: Date,
  ) { }
  deadline(): Date {
    return this._deadline
  }
  done(): Promise<void> {
    return this._cancelContext.done()
  }
  err(): CanceledError | DeadlineExceededError | null {
    return this._cancelContext.err()
  }
  value(key: any) {
    return this._cancelContext.value(key)
  }
  toString() {
    return `${this._cancelContext.context}.WithDeadline(${this._deadline})`
  }
  cancel(removeFromParent: boolean, err: CanceledError | DeadlineExceededError | null | undefined): void {
    this._cancelContext.cancel(false, err)
    if (removeFromParent) {
      // Remove this TimerContext from its parent CancelContext's children.
      removeChild(this._cancelContext.context, this)
    }
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }
  }
}
