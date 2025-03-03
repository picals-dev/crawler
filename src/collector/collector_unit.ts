import type { Agents } from 'got'
import type { Selector } from './selectors.ts'
import got from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { StatusCodes } from 'http-status-codes'
import { debug_config, download_config, network_config } from '~/configs/index.ts'
import { assertWarn, printInfo } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

export async function collect(
  url: string,
  selector: Selector,
  additionalHeaders: Record<string, string> = {},
) {
  const headers = { ...network_config.headers, ...additionalHeaders }

  if (debug_config.verbose) {
    printInfo(`Collecting data from ${url}`)
  }

  await sleep(download_config.thread_delay)

  for (let attempt = 0; attempt < download_config.retry_times; attempt++) {
    try {
      const agent: Agents | undefined = network_config.proxy.http
        ? { http: new HttpProxyAgent({ proxy: network_config.proxy.http }) }
        : network_config.proxy.https
          ? { https: new HttpsProxyAgent({ proxy: network_config.proxy.https }) }
          : undefined

      const response = await got(url, { headers, agent, timeout: { connect: download_config.timeout } })

      if (response.statusCode === StatusCodes.OK) {
        const idGroup = selector(response)
        if (debug_config.verbose) {
          printInfo(`${url} collected complete`)
        }
        return idGroup
      }
    }
    catch (error: any) {
      assertWarn(!debug_config.show_error, error)
      assertWarn(!debug_config.show_error, `This is ${attempt} attempt to collect ${url}`)
      await sleep(download_config.fail_delay)
    }
  }

  assertWarn(!debug_config.show_error, `Failed to collect ${url}`)
  await writeFailLog(`Failed to collect ${url}`)
}
