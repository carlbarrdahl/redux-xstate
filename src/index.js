export function createMiddleware(machine, actionMap) {
  // TODO: check hierarchical states
  const validActions = Object.keys(machine.config.states)
    .map(key => Object.keys(machine.config.states[key].on))
    .reduce((a, b) => a.concat(b), [])
    .filter((key, pos, arr) => arr.indexOf(key) === pos)

  return store => next => action => {
    if (validActions.includes(action.type)) {
      const nextState = machine.transition(
        store.getState().machine.value,
        action,
        store.getState()
      )

      store.dispatch({
        type: "@@machine/UPDATE_STATE",
        payload: nextState
      })

      nextState.actions
        .map(key => actionMap[key])
        .filter(Boolean)
        .forEach(action => action(store.dispatch, store.getState()))
    }

    next(action)
  }
}

export function createReducer(initialState) {
  return (state = initialState, { type, payload }) => {
    switch (type) {
      case "@@machine/UPDATE_STATE":
        return payload
    }
    return state
  }
}
