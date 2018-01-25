# redux-xstate
Redux middleware for [xstate](https://github.com/davidkpiano/xstate)

## Installation
```bash
$ npm install redux-xstate
```

## Usage
```js
import { createMiddleware, createReducer } from 'redux-xstate'

const actionMap = {
  log: (dispatch, state) => fetch(LOG_URL, {
    method: "POST",
    body: JSON.stringify(state)
  })
}
const stateChart = {
  key: "light",
  initial: "green",
  states: {
    green: {
      on: {
        TIMER: "yellow"
      }
    },
    yellow: {
      on: {
        TIMER: "red"
      }
    },
    red: {
      on: {
        TIMER: "green"
      },
      onEntry: ["log"]
    }
  }
}

const machine = Machine(stateChart)

const store = createStore(
  combineReducers({
    machine: createReducer(machine.initialState)
  }),
  applyMiddleware(createMiddleware(machine, actionMap))
)

store.dispatch("TIMER")

// state.machine.value === "yellow"
```

## License

[MIT](LICENSE)
