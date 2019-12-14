import { getChildrenWithRank } from './getChildrenWithRank.js'

/** Gets the next rank at the end of a list. */
export const getNextRank = (thoughtsRanked, thoughtIndex, contextIndex) => {
  const children = getChildrenWithRank(thoughtsRanked, thoughtIndex, contextIndex)
  return children.length > 0
    ? children[children.length - 1].rank + 1
    : 0
}
