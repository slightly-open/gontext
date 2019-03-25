import { Context } from '@/types'
import CanceledError from '@/errors/canceledError'
import DeadlineExceededError from '@/errors/deadlineExceeded'
import { Canceler, removeChild } from '@/core'

const RESOLVED_PROMISE = Promise.resolve()

interface DoneStruct {
  promise: Promise<void>
  resolve?: () => void
}

export default class CancelContext implements Context, Canceler {
  public _done: null | DoneStruct = null
  public _err: null | CanceledError | DeadlineExceededError = null
  public _children: null | Set<Canceler> = null

  constructor(public context: Context) { }

  deadline(): Date | null {
    return this.context.deadline()
  }
  done(): Promise<void> {
    if (this._done === null) {
      let doneResolve: DoneStruct['resolve']
      const promise = new Promise<void>(resolve => doneResolve = resolve)
      this._done = {
        promise,
        resolve: doneResolve,
      }
    }
    return this._done.promise
  }
  err(): CanceledError | DeadlineExceededError | null {
    return this._err
  }
  value(key: any) {
    return this.context.value(key)
  }
  cancel(removeFromParent: boolean, err: CanceledError | DeadlineExceededError | undefined | null): void {
    if (err === null || err === undefined) {
      throw new Error('CancelContext: internal error: missing cancel error.')
    }
    if (this._err !== null) {
      return // already canceled
    }
    this._err = err
    if (this._done === null) {
      this._done = { promise: RESOLVED_PROMISE }
    } else if (this._done.resolve) {
      this._done.resolve()
    }
    if (this._children !== null) {
      for (const child of this._children) {
        child.cancel(false, err)
      }
      this._children = null
    }
    if (removeFromParent) {
      removeChild(this.context, this)
    }
  }
  toString(): string {
    return `${this.context}.withCancel`
  }
}
