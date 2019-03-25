import { Context, CancelFunc } from './types'
import CanceledError from './errors/canceledError'
import EmptyContext from './contexts/emptyContext'
import CancelContext from './contexts/cancelContext'
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

export function withCancel(context: Context): { context: Context, cancel: CancelFunc } {
  const cancelCtx = new CancelContext(context)
  propagateCancel(context, cancelCtx)
  return {
    context: cancelCtx,
    cancel: () => cancelCtx.cancel(true, canceledError),
  }
}
