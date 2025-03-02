import { printObj } from '~/utils/printObj.ts'
import { DebugConfig } from './modules/debug_config.ts'
import { DownloadConfig } from './modules/download_config.ts'
import { NetworkConfig } from './modules/network_config.ts'
import { UserConfig } from './modules/user_config.ts'

const debug_config = new DebugConfig()
const download_config = new DownloadConfig()
const network_config = new NetworkConfig()
const user_config = new UserConfig()

export function displayAllConfigs() {
  printObj(debug_config, 2, 'Debug Config:')
  printObj(download_config, 2, 'Download Config:')
  printObj(network_config, 2, 'Network Config:')
  printObj(user_config, 2, 'User Config:')
}
