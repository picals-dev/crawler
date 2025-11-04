import { debugConfig } from '~/configs/index.ts'
import { createHttpClient } from './creator.ts'

export const client = createHttpClient({
  showReqInfo: () => debugConfig.showReqInfo,
  showResInfo: () => debugConfig.showResInfo,
})
