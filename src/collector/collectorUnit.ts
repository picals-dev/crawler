import type { Selector } from './selectors.ts'
import { StatusCodes } from 'http-status-codes'
import { client } from '~/client/index.ts'
import { debugConfig, downloadConfig, networkConfig } from '~/configs/index.ts'
import { printInfo, printWarn } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

// 从指定 URL 收集数据并使用选择器提取所需信息
export async function collect(
  url: string,
  selector: Selector,
  additionalHeaders: Record<string, string> = {},
): Promise<string[] | undefined> {
  const headers = { ...networkConfig.headers, ...additionalHeaders }

  if (debugConfig.verbose) {
    printInfo(`Collecting data from ${url}`)
  }

  await sleep(downloadConfig.startDelay)

  for (let attempt = 0; attempt < downloadConfig.retryTimes; attempt++) {
    try {
      const response = await client(url, {
        headers,
        agent: networkConfig.agent,
        timeout: { connect: downloadConfig.timeout },
      })

      if (response.statusCode === StatusCodes.OK) {
        const idGroup = selector(response)
        if (debugConfig.verbose) {
          printInfo(`${url} collected complete`)
        }
        return idGroup
      }
    }
    catch (error: any) {
      printWarn(debugConfig.showError, error)
      printWarn(debugConfig.showError, `This is ${attempt + 1} attempt to collect ${url}`)
      await sleep(downloadConfig.failDelay)
    }
  }

  printWarn(debugConfig.showError, `Failed to collect ${url}`)
  await writeFailLog(`Failed to collect ${url}`)
}
