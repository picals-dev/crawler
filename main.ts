import {
  // downloadBookmark,
  // downloadKeyword,
  downloadUser,
} from './src'
import { debugConfig, displayAllConfigs, downloadConfig, networkConfig, userConfig } from './src/configs'
import { DEFAULT_STORE_PATH } from './src/utils/constants.ts'

async function bootstrap() {
  networkConfig.proxy = {}

  debugConfig.verbose = true
  debugConfig.showError = false

  userConfig.userId = ''
  userConfig.cookie = ''

  downloadConfig.storePath = `${DEFAULT_STORE_PATH}`
  downloadConfig.withTag = false

  displayAllConfigs()

  await downloadUser({ artistId: '' })
}

bootstrap()
