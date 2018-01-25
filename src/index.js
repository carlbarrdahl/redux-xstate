function getActions(states) {
  return Object.keys(states)
    .map(key => {
      const state = states[key]
      const actions = Object.keys(state.on || {})

      return state.states ? getActions(state.states) : actions
    })
    .reduce((a, b) => a.concat(b), [])
    .filter((key, pos, arr) => arr.indexOf(key) === pos)
}

export function createMiddleware(machine, actionMap) {
  const validActions = getActions(machine.config.states)

  return ({ dispatch, getState }) => next => action => {
    if (validActions.includes(action.type)) {
      const state = getState()
      const nextState = machine.transition(state.machine.value, action, state)

      dispatch({
        type: "@@machine/UPDATE_STATE",
        payload: nextState
      })

      nextState.actions
        .map(key => actionMap[key])
        .filter(Boolean)
        .forEach(action => action(dispatch, state))
    }

    next(action)
  }
}

export function createReducer(initialState) {
  return (state = initialState, { type, payload }) =>
    type === "@@machine/UPDATE_STATE" ? payload : state
}
