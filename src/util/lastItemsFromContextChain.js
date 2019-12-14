import { store } from '../store.js'

// util
import { head } from './head.js'
import { splice } from './splice.js'
import { headKey } from './headKey.js'
import { contextOf } from './contextOf.js'
import { rankItemsFirstMatch } from './rankItemsFirstMatch.js'
import { getThought } from './getThought.js'

/** Generates thoughtsRanked from the last segment of a context chain */
export const lastItemsFromContextChain = (contextChain, state = store.getState()) => {
  if (contextChain.length === 1) return contextChain[0]
  const penult = contextChain[contextChain.length - 2]
  const item = getThought(headKey(penult), state.thoughtIndex)
  const ult = contextChain[contextChain.length - 1]
  const parent = item.memberOf.find(parent => head(parent.context) === ult[0].key)
  const thoughtsRankedPrepend = contextOf(rankItemsFirstMatch(parent.context, { state }))
  return thoughtsRankedPrepend.concat(splice(ult, 1, 0, head(penult)))
}
