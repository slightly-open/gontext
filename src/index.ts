import { Context, CancelFunc } from './types'
import CanceledError from './errors/canceledError'
import EmptyContext from './contexts/emptyContext'
import CancelContext from './contexts/cancelContext'
import ValueContext from './contexts/valueContext'
import { propagateCancel } from './core'

const backgroundCtx = new EmptyContext('background')
const todoCtx = new EmptyContext('TODO')
const canceledError = new CanceledError()
/**
 * background returns a non-nul, empty Context. It is never canceled, has no
 * values, and has no deadline. It is typically used by the main function,
 * initialization, and tests, and as the top-level Context for incoming
 * requests.
 */
export function background(): Context {
  return backgroundCtx
}

/**
 * TODO returns a non-nul, empty Context. Code should use context.TODO when
 * it's unclear which Context to use or it is not yet available (because the
 * surrounding function has not yet been extended to accept a Context
 * parameter).
 */
// tslint:disable-next-line:function-name
export function TODO(): Context {
  return todoCtx
}

/**
 * withCancel returns a copy of parent with a new Done promise. The returned
 * context's Done promise is resolved when the returned cancel function is called
 * or when the parent context's Done promise is resolved, whichever happens first.
 *
 * Canceling this context releases resources associated with it, so code should
 * call cancel as soon as the operations running in this Context complete.
 */
export function withCancel(context: Context): { context: Context, cancel: CancelFunc } {
  const cancelCtx = new CancelContext(context)
  propagateCancel(context, cancelCtx)
  return {
    context: cancelCtx,
    cancel: () => cancelCtx.cancel(true, canceledError),
  }
}

/**
 * withValue returns a copy of parent in which the value associated with key is
 * val.
 * Use context Values only for request-scoped data that transits processes and
 * APIs, not for passing optional parameters to functions.
 */
export function withValue(parent: Context, key: any, val: any) {
  if (key === null || key === undefined) {
    throw new Error('context.withValue : key cannot be null or undefined')
  }
  return new ValueContext(parent, key, val)
}
