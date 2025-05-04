import { debug_config } from '~/configs/index.ts'
import { createHttpClient } from './creator.ts'

export const client = createHttpClient({
  showReqInfo: () => debug_config.show_req_info,
  showResInfo: () => debug_config.show_res_info,
})
