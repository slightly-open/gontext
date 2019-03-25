import { Context, CancelFunc } from './types'
import EmptyContext from './contexts/emptyContext'

const backgroundCtx = new EmptyContext('background')
const todoCtx = new EmptyContext('TODO')

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
