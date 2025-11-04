import { printObj } from '~/utils/printObj.ts'
import { DebugConfig } from './modules/debugConfig.ts'
import { DownloadConfig } from './modules/downloadConfig.ts'
import { NetworkConfig } from './modules/networkConfig.ts'
import { UserConfig } from './modules/userConfig.ts'

// 导出每个配置类的实例（单例模式）
export const debugConfig = new DebugConfig()
export const downloadConfig = new DownloadConfig()
export const networkConfig = new NetworkConfig()
export const userConfig = new UserConfig()

export function displayAllConfigs() {
  printObj(debugConfig, 2, 'Debug Config:')
  printObj(downloadConfig, 2, 'Download Config:')
  printObj(networkConfig, 2, 'Network Config:')
  printObj(userConfig, 2, 'User Config:')
}
