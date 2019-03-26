import { Context } from '@/types'
import CanceledError from '@/errors/canceledError'
import DeadlineExceededError from '@/errors/deadlineExceeded'

export default class ValueContext implements Context {
  constructor (
    public context: Context,
    public _key: any,
    public _value: any,
  ) { }

  deadline(): Date | null {
    return this.context.deadline()
  }
  done(): Promise<void> | null {
    return this.context.done()
  }
  err(): CanceledError | DeadlineExceededError | null {
    return this.context.err()
  }
  value(key: any) {
    if (this._key === key) {
      return this._value
    }
    return this.context.value(key)
  }
  toString(): string {
    return `${this.context}.withValue(${this._key}, ${this._value})`
  }

}
