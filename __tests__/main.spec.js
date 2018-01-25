import { Machine } from "xstate"
import { createStore, combineReducers, applyMiddleware } from "redux"

import { createMiddleware, createReducer } from "../src"

describe("xstate middleware", () => {
  const actionMap = {
    mockFn: jest.fn()
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
        initial: "walk",
        states: {
          walk: {
            on: {
              PED_COUNTDOWN: "wait"
            },
            onEntry: ["mockFn"]
          },
          wait: {
            on: {
              PED_COUNTDOWN: "stop"
            }
          },
          stop: {}
        }
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

  it("transitions machine state", () => {
    store.dispatch({ type: "TIMER" })

    expect(store.getState().machine.value).toBe("yellow")
  })

  it("trigger actions", () => {
    store.dispatch({ type: "TIMER" })

    expect(store.getState().machine.value).toEqual({ red: "walk" })
    expect(actionMap.mockFn.mock.calls.length).toBe(1)
    expect(actionMap.mockFn.mock.calls[0][2]).toEqual({ type: "TIMER" })
  })
})
