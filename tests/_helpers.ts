import { Context } from '../src/types'
import CanceledError from '../src/errors/canceledError'
import DeadlineExceededError from '../src/errors/deadlineExceeded'

/**
 * OtherContext is a Context that's not one of the types defined in src/contexts.
 * This lets us test code paths that differ based on the underlying type of the
 * Context.
 */
export class OtherContext implements Context {
  constructor(public context: Context) { }

  deadline(): Date | null {
    return this.context.deadline()
  }
  done(): Promise<void> | null {
    return this.context.done()
  }
  err(): null | CanceledError | DeadlineExceededError {
    return this.context.err()
  }
  value(key: any) {
    return this.context.value(key)
  }
  toString() {
    return this.context.toString()
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

type PromiseState = 'null' | 'pending' | 'resolved' | 'rejected'
const pendingSymbol = Symbol.for('pending')
export function getPromiseState<T = void>(promise: Promise<T> | null): Promise<PromiseState> {
  if (promise === null) {
    return Promise.resolve('null' as PromiseState)
  }
  return Promise.race([promise, pendingSymbol])
    .then(
      res => res === pendingSymbol ? 'pending' : 'resolved',
      _ => 'rejected' as PromiseState,
    )
}

export function wrapWithTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]) as Promise<T>
}
