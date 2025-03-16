import type { Selector } from './selectors.ts'
import got from 'got'
import { StatusCodes } from 'http-status-codes'
import { debug_config, download_config, network_config } from '~/configs/index.ts'
import { assertWarn, printInfo } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

/**
 * 从指定URL收集数据并使用选择器提取所需信息
 *
 * 该函数负责从给定的URL获取数据，并使用提供的选择器函数处理响应内容。
 * 支持重试机制、代理设置和自定义请求头，适用于各种网络环境下的数据采集。
 *
 * @param {string} url - 要采集数据的目标URL
 * @param {Selector} selector - 用于从响应中提取数据的选择器函数
 * @param {Record<string, string>} additionalHeaders - 附加的HTTP请求头，默认为空对象
 *
 * @returns {Promise<string[] | undefined>} 返回选择器函数处理后的数据，通常是ID组或其他提取的信息
 *                         如果所有重试都失败，则返回undefined
 *
 * @throws 不会直接抛出异常，但会记录失败信息到日志文件
 *
 * @example
 * // 使用示例
 * const imageIds = await collect(
 *   'https://www.pixiv.net/ajax/user/12345/profile/all?lang=zh',
 *   selectUser,
 *   { 'Referer': 'https://www.pixiv.net/users/12345' }
 * );
 */
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
      const response = await got(url, { headers, agent: network_config.agent, timeout: { connect: download_config.timeout } })

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
      assertWarn(!debug_config.show_error, `This is ${attempt + 1} attempt to collect ${url}`)
      await sleep(download_config.fail_delay)
    }
  }

  assertWarn(!debug_config.show_error, `Failed to collect ${url}`)
  await writeFailLog(`Failed to collect ${url}`)
}
