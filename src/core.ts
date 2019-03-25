import { Context } from './types'
import CanceledError from './errors/canceledError'
import DeadlineExceededError from './errors/deadlineExceeded'
import CancelContext from './contexts/cancelContext'
import TimerContext from './contexts/timerContext'
import ValueContext from './contexts/valueContext'

/**
 * A Canceler is a context type that can be canceled directly. The
 * implementations are CancelContext and TimerContext.
 */
export interface Canceler {
  cancel(removeFromParent: boolean, err: undefined | null | CanceledError | DeadlineExceededError): void
  done(): Promise<void>
}

/** removeChild removes a context from its parent. */
export function removeChild(parent: Context, child: Canceler) {
  const cancelCtx = getParentCancelContext(parent)
  if (cancelCtx === null) {
    return
  }
  if (cancelCtx._children !== null) {
    cancelCtx._children.delete(child)
  }
}

/**
 * getParentCancelContext follows a chain of parent references until it finds a
 * CancelContext. This function understands how each of the concrete types in this
 * package represents its parent.
 */
export function getParentCancelContext(parent: Context): CancelContext | null {
  let p = parent
  while (true) {
    if (p instanceof CancelContext) {
      return p
    }
    if (p instanceof TimerContext) {
      return p.cancelContext
    }
    if (p instanceof ValueContext) {
      p = p.context
    } else {
      return null
    }
  }
}

/** propagateCancel arranges for child to be canceled when parent is. */
export function propagateCancel(parent: Context, child: Canceler) {
  const parentDone = parent.done()
  if (parentDone === null) {
    return // parent is never canceled
  }
  const p = getParentCancelContext(parent)
  if (p !== null) {
    if (p._err !== null) {
      // parent has already been canceled
      child.cancel(false, p._err)
    } else {
      if (p._children === null) {
        p._children = new Set<Canceler>()
      }
      p._children.add(child)
    }
  } else {
    // following code if functional equivalent
    // of golang select statement
    let parentDoneFirst = false
    Promise.race([
      parentDone.then(() => parentDoneFirst = true),
      child.done(),
    ]).then(() => {
      if (parentDoneFirst) {
        child.cancel(false, parent.err())
      }
    })
  }
}
