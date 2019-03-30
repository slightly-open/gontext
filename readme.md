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
Background returns a non-null, empty Context. It is never canceled, has no values, and has no deadline. It is typically used by the main function, initialization, and tests, and as the top-level Context for incoming requests.

### TODO
```typescript
import { TODO } from 'gontext'
const todoCtx = TODO()
```
TODO returns a non-null, empty Context. Code should use context.TODO when it's unclear which Context to use or it is not yet available (because the surrounding function has not yet been extended to accept a Context parameter).

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
