/* eslint-disable fp/no-mutating-methods */
import { store } from '../store.js'
import * as localForage from 'localforage'
import {
  RENDER_DELAY,
} from '../constants.js'

// util
import { timestamp } from './timestamp.js'
import { syncRemote } from './syncRemote.js'
import { dbOperations } from '../db'

/** Saves thoughtIndex to state, localStorage, and Firebase. */
// assume timestamp has already been updated on thoughtIndexUpdates
export const sync = (thoughtIndexUpdates = {}, contextIndexUpdates = {}, { local = true, remote = true, state = true, forceRender, updates, callback, recentlyEdited } = {}) => {

  const lastUpdated = timestamp()
  // state
  // NOTE: state here is a boolean value indicating whether to sync to state
  if (state) {
    store.dispatch({
      type: 'thoughtIndex',
      thoughtIndexUpdates,
      contextIndexUpdates,
      forceRender
    })
  }

  // localStorage
  const localPromises = local ? (() => {
    // thoughtIndex
    console.log(thoughtIndexUpdates)

    const thoughtIndexPromises = [
      ...Object.keys(thoughtIndexUpdates).map(key => thoughtIndexUpdates[key] != null
        ? dbOperations.updateThoughtIndex(key, thoughtIndexUpdates[key])
        : dbOperations.deleteThoughtIndex(key)),
      dbOperations.updateLastUpdated(lastUpdated)
    ]

    // contextIndex
    const contextIndexPromises = [
      ...Object.keys(contextIndexUpdates).map(contextEncoded => {
        const children = contextIndexUpdates[contextEncoded]
        return (children && children.length > 0
          ? dbOperations.updateContextIndex(contextEncoded, children)
          : dbOperations.deleteContextIndex(contextEncoded))
      }),
      dbOperations.updateLastUpdated(lastUpdated)
    ]

    // recentlyEdited
    const recentlyEditedPromise = recentlyEdited
      ? dbOperations.updateRecentlyEdited(recentlyEdited)
      : null

    // schemaVersion
    const schemaVersionPromise = updates && updates.schemaVersion
      ? dbOperations.updateSchemaVersion(updates.schemaVersion)
      : null

    return [thoughtIndexPromises, contextIndexPromises, recentlyEditedPromise, schemaVersionPromise]
  })()
    : []

  return Promise.all(localPromises).then(async () => {

    const x = await dbOperations.getThoughtIndexes()
    console.log(x)

    // firebase
    if (remote) {
      return syncRemote(thoughtIndexUpdates, contextIndexUpdates, recentlyEdited, updates, callback)
    }
    else {
      // do not let callback outrace re-render
      if (callback) {
        setTimeout(callback, RENDER_DELAY)
      }

      return Promise.resolve()
    }

  })

}
