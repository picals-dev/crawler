import {
  // downloadBookmark,
  // downloadKeyword,
  downloadUser,
} from './src'
import { debug_config, displayAllConfigs, download_config, network_config, user_config } from './src/configs'
import { DEFAULT_STORE_PATH } from './src/configs/modules/download_config.ts'
import { ensurePath } from './src/utils/ensurePath.ts'

async function bootstrap() {
  network_config.proxy = {} // 设置代理，如果不需要代理，则设置为空对象
  // network_config.headers = {}

  debug_config.verbose = true
  debug_config.show_error = false

  user_config.user_id = ''
  user_config.cookie = ''

  download_config.store_path = `${DEFAULT_STORE_PATH}`
  download_config.with_tag = false
  download_config.url_only = false

  displayAllConfigs()

  await ensurePath(download_config.store_path)

  await downloadUser({ artistId: '3360208' })
}

bootstrap()
