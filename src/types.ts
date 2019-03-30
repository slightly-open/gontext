import CanceledError from './errors/canceledError'
import DeadlineExceededError from './errors/deadlineExceeded'

export interface Context {
  /**
   * deadline returns the time when work done on behalf of this context
   * should be canceled. deadline returns null when no deadline is
   * set. Successive calls to deadline always return the same results.
   */
  deadline(): null | Date

  done(): null | Promise<void>

  /**
   * If Done is not yet closed, Err returns null.
   * If Done is closed, Err returns a non-nil error explaining why:
   * CanceledError if the context was canceled
   * or DeadlineExceededError if the context's deadline passed.
   * After Err returns a non-null error, successive calls to Err
   * return the same error.
   */
  err(): null | CanceledError | DeadlineExceededError

  value(key: any): any | undefined
}

/**
 * A CancelFunc tells an operation to abandon its work.
 * A CancelFunc does not wait for the work to stop.
 * After the first call, subsequent calls to a CancelFunc do nothing.
 */
export type CancelFunc = () => void

export interface ContextAndCancel {
  context: Context
  cancel: CancelFunc
}
