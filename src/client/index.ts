import { debug_config } from '~/configs/index.ts'
import { createHttpClient } from './creator.ts'

export const client = createHttpClient({
  debug: debug_config.verbose,
})
