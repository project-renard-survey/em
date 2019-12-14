import { store } from '../store.js'
import {
  RANKED_ROOT,
  ROOT_TOKEN,
} from '../constants.js'

// util
import { isRoot } from './isRoot.js'
import { isContextViewActive } from './isContextViewActive.js'
import { equalArrays } from './equalArrays.js'
import { head } from './head.js'
import { headKey } from './headKey.js'
import { contextChainToThoughtsRanked } from './contextChainToThoughtsRanked.js'
import { splitChain } from './splitChain.js'
import { getContexts } from './getContexts.js'
import { getContextsSortedAndRanked } from './getContextsSortedAndRanked.js'
import { unroot } from './unroot.js'
import { getThought } from './getThought.js'

/** Ranks the items from their rank in their context. */
// if there is a duplicate item in the same context, takes the first
// NOTE: path is unranked
export const rankItemsFirstMatch = (pathUnranked, { state = store.getState() } = {}) => {
  if (isRoot(pathUnranked)) return RANKED_ROOT

  const { thoughtIndex } = state
  let thoughtsRankedResult = RANKED_ROOT // eslint-disable-line fp/no-let
  let prevParentContext = [ROOT_TOKEN] // eslint-disable-line fp/no-let

  return pathUnranked.map((key, i) => {
    const item = getThought(key, thoughtIndex)
    const contextPathUnranked = i === 0 ? [ROOT_TOKEN] : pathUnranked.slice(0, i)
    const contextChain = splitChain(thoughtsRankedResult, { state })
    const thoughtsRanked = contextChainToThoughtsRanked(contextChain)
    const context = unroot(prevParentContext).concat(headKey(thoughtsRanked))
    const inContextView = i > 0 && isContextViewActive(contextPathUnranked, { state })
    const contexts = (inContextView ? getContextsSortedAndRanked : getContexts)(inContextView ? head(contextPathUnranked) : key, thoughtIndex)

    const parent = inContextView
      ? contexts.find(child => head(child.context) === key)
      : ((item && item.memberOf) || []).find(p => equalArrays(p.context, context))

    if (parent) {
      prevParentContext = parent.context
    }

    const thoughtRanked = {
      key,
      // NOTE: we cannot throw an error if there is no parent, as it may be a floating context
      // unfortunately this that there is no protection against a (incorrectly) missing parent
      rank: parent ? parent.rank : 0
    }

    thoughtsRankedResult = unroot(thoughtsRankedResult.concat(thoughtRanked))

    return thoughtRanked
  })
}
