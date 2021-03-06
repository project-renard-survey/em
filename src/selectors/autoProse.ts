// eslint-disable-next-line no-unused-vars
import { Child, Context } from '../types'
import { isMobile } from '../browser'
import { AUTO_PROSE_VIEW_MIN_CHARS } from '../constants'
import { isURL } from '../util'
import { getThoughts } from '../selectors'

const minChars = isMobile ? AUTO_PROSE_VIEW_MIN_CHARS : AUTO_PROSE_VIEW_MIN_CHARS

/** Returns true if over half of the context's children are long enough to count as prose. */
const autoProse = (state: any, context: Context, { childrenForced }: any = {}) => {

  // count non-URL children
  const children = (childrenForced || getThoughts(state, context))
    .filter((child: Child) => !isURL(child.value))

  return children.filter((child: Child) => child.value.length > minChars).length > children.length / 2
}

export default autoProse
