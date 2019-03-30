# `gontext` - Port of context implementation from golang
See https://golang.org/pkg/context/ for more details

## Installation

```bash
npm install --save gontext
# OR
yarn add gontext
```

## API

### background
```typescript
import { background } from 'gontext'
const backgroundCtx = background()
```
Background returns a non-null, empty Context. It is never canceled, has no values, and has no deadline.
It is typically used by the main function, initialization, and tests, and as the top-level
Context for incoming requests.

### TODO
```typescript
import { TODO } from 'gontext'
const todoCtx = TODO()
```
TODO returns a non-null, empty Context. Code should use context.TODO when it's unclear which Context to use
or it is not yet available (because the surrounding function has not yet been extended to accept
a Context parameter).

### withCancel
```typescript
import { withCancel } from 'gontext'
const [context, cancel] = withCancel(background())
// some logic...
cancel()
```
withCancel returns a copy of parent with a new Done promise. The returned
context's Done promise is resolved when the returned cancel function is called
or when the parent context's Done promise is resolved, whichever happens first.

Canceling this context releases resources associated with it, so code should
call cancel as soon as the operations running in this Context complete.

### withValue
```typescript
import { withValue } from 'gontext'
const context = withValue(background(), 'key', 'my-value')
// some logic...
context.value() // 'my-value'
```
withValue returns a copy of parent in which the value associated with key is val.

Use context Values only for request-scoped data that transits processes and
APIs, not for passing optional parameters to functions.

## For developers

### Prerequisites

You need `yarn` at least `v1.12.3`. Well, you can use `npm` too, but all scripts bellow are for `yarn`.

### Available scripts

```bash
# install dependencies
yarn

# run tests
yarn test

# run linter (with fix)
yarn lint

# build JS and type definitions
yarn build
```

### VS code launch configuration
You may want to debug tests. Following launch configuration for VS code makes it possible

```json
{
  "type": "node",
  "request": "launch",
  "name": "Mocha All",
  "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
  "args": [
    "-r",
    "ts-node/register",
    "-r",
    "tsconfig-paths/register",
    "--timeout",
    "999999",
    "--colors",
    "${workspaceFolder}/tests/**/*.spec.ts",
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "protocol": "inspector"
}
```
