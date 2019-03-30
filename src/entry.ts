import { Context, ContextAndCancel } from './types'
import { propagateCancel } from './core'
import CanceledError from './errors/canceledError'
import DeadlineExceededError from './errors/deadlineExceeded'
import { backgroundCtx, todoCtx } from './contexts/emptyContext'
import CancelContext from './contexts/cancelContext'
import ValueContext from './contexts/valueContext'
import TimerContext from './contexts/timerContext'

const canceledError = new CanceledError()
const deadlineExceededError = new DeadlineExceededError()

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
export function withCancel(context: Context): ContextAndCancel {
  const cancelCtx = getCancelContext(context)
  propagateCancel(context, cancelCtx)
  return [cancelCtx, () => cancelCtx.cancel(true, canceledError)]
}

/**
 * withValue returns a copy of parent in which the value associated with key is
 * val.
 * Use context Values only for request-scoped data that transits processes and
 * APIs, not for passing optional parameters to functions.
 */
export function withValue(parent: Context, key: any, val: any): Context {
  if (key === null || key === undefined) {
    throw new Error('context.withValue : key cannot be null or undefined')
  }
  return new ValueContext(parent, key, val)
}

/**
 * withDeadline returns a copy of the parent context with the deadline adjusted
 * to be no later than d. If the parent's deadline is already earlier than d,
 * withDeadline(parent, d) is semantically equivalent to parent. The returned
 * context's Done channel is closed when the deadline expires, when the returned
 * cancel function is called, or when the parent context's Done channel is
 * closed, whichever happens first.
 *
 * Canceling this context releases resources associated with it, so code should
 * call cancel as soon as the operations running in this Context complete.
 */
export function withDeadline(parent: Context, d: Date): ContextAndCancel {
  const parentDeadline = parent.deadline()
  if (parentDeadline !== null && parentDeadline < d) {
    // The current deadline is already sooner than the new one.
    return withCancel(parent)
  }
  const c = new TimerContext(getCancelContext(parent), d)
  propagateCancel(parent, c)
  const duration = Date.now() - d.getTime()
  if (duration <= 0) {
    c.cancel(true, deadlineExceededError) // deadline has already passed
    return [c, () => c.cancel(false, canceledError)]
  }
  if (c.err() === null) {
    c._timeoutId = setTimeout(
      () => c.cancel(true, deadlineExceededError),
      duration,
    )
  }
  return [c, () => c.cancel(true, canceledError)]
}

/**
 * withTimeout returns withDeadline(parent, new Date(Date.now() + timeoutMs))
 */
export function withTimeout(parent: Context, timeoutMs: number): ContextAndCancel {
  return withDeadline(parent, new Date(Date.now() + timeoutMs))
}

/** getCancelContext returns an initialized CancelContext. */
function getCancelContext(parent: Context): CancelContext {
  return new CancelContext(parent)
}
