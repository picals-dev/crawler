import {
  // downloadBookmark,
  // downloadKeyword,
  downloadUser,
} from './src'
import { debug_config, displayAllConfigs, download_config, network_config, user_config } from './src/configs'
import { DEFAULT_STORE_PATH } from './src/utils/constants.ts'
import { ensurePath } from './src/utils/ensurePath.ts'

async function bootstrap() {
  network_config.proxy = {}

  debug_config.verbose = true
  debug_config.show_error = false

  user_config.user_id = ''
  user_config.cookie = ''

  download_config.store_path = `${DEFAULT_STORE_PATH}`
  download_config.with_tag = false

  displayAllConfigs()

  await ensurePath(download_config.store_path)

  await downloadUser({ artistId: '16629961' })
}

bootstrap()
