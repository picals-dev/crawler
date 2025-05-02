import type { Selector } from './selectors.ts'
import { StatusCodes } from 'http-status-codes'
import { client } from '~/client/index.ts'
import { debug_config, download_config, network_config } from '~/configs/index.ts'
import { printInfo, printWarn } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

// 从指定 URL 收集数据并使用选择器提取所需信息
export async function collect(
  url: string,
  selector: Selector,
  additionalHeaders: Record<string, string> = {},
): Promise<string[] | undefined> {
  const headers = { ...network_config.headers, ...additionalHeaders }

  if (debug_config.verbose) {
    printInfo(`Collecting data from ${url}`)
  }

  await sleep(download_config.start_delay)

  for (let attempt = 0; attempt < download_config.retry_times; attempt++) {
    try {
      const response = await client(url, {
        headers,
        agent: network_config.agent,
        timeout: { connect: download_config.timeout },
      })

      if (response.statusCode === StatusCodes.OK) {
        const idGroup = selector(response)
        if (debug_config.verbose) {
          printInfo(`${url} collected complete`)
        }
        return idGroup
      }
    }
    catch (error: any) {
      printWarn(debug_config.show_error, error)
      printWarn(debug_config.show_error, `This is ${attempt + 1} attempt to collect ${url}`)
      await sleep(download_config.fail_delay)
    }
  }

  printWarn(debug_config.show_error, `Failed to collect ${url}`)
  await writeFailLog(`Failed to collect ${url}`)
}
