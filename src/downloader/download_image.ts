import type { Agents } from 'got'
import fs from 'node:fs/promises'
import path from 'node:path'
import got from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { StatusCodes } from 'http-status-codes'
import { debug_config, download_config, network_config } from '~/configs/index.ts'
import { checkPath } from '~/utils/checkPath.ts'
import { assertError, assertWarn, printInfo } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

export async function downloadImage(url: string, initialTimeout: number = 10): Promise<number> {
  // 1. Extract image name & image ID from URL
  const imageName = url.split('/').pop()
  if (!imageName) {
    assertError(false, `Cannot extract image name from URL: ${url}`)
  }
  const regRes = imageName!.match(/(\d+)_/)
  if (!regRes) {
    assertError(false, `Bad URL in image downloader: ${url}`)
  }

  // 2. Set headers for the request
  const imageId = regRes![1]
  const headers = {
    Referer: `https://www.pixiv.net/artworks/${imageId}`,
    ...network_config.headers,
  }

  if (debug_config.verbose) {
    printInfo(`Downloading image: ${imageName}`)
  }
  await sleep(download_config.thread_delay)

  // 3. Check if the image already exists
  const imagePath = path.join(download_config.store_path, imageName!)
  const checkPathRes = await checkPath(imagePath)
  if (checkPathRes.exists) {
    assertWarn(!debug_config.verbose, `Image ${imageName} already exists.`)
    return 0
  }

  let downloadTimeout = initialTimeout

  for (let attempt = 0; attempt < download_config.retry_times; attempt++) {
    try {
      const agent: Agents | undefined = network_config.proxy.http
        ? { http: new HttpProxyAgent({ proxy: network_config.proxy.http }) }
        : network_config.proxy.https
          ? { https: new HttpsProxyAgent({ proxy: network_config.proxy.https }) }
          : undefined

      const controller = new AbortController()
      // Cut off the download if it takes too long
      const timeoutId = setTimeout(() => controller.abort(), downloadTimeout * 1000)

      const response = await got(url, {
        headers,
        agent,
        timeout: { connect: download_config.timeout },
        signal: controller.signal,
        retry: { limit: 0 },
      })
      clearTimeout(timeoutId)

      if (response.statusCode === StatusCodes.OK) {
        const imageSize = Number.parseInt(response.headers['content-length'] || '0', 10)

        // Check if the image size is correct
        if (imageSize > 0 && response.rawBody.length !== imageSize) {
          assertWarn(!debug_config.show_error, `Image ${imageName} is incomplete, retrying...`)
          await sleep(download_config.fail_delay)
          downloadTimeout = Math.min(downloadTimeout * 2, download_config.max_timeout)
          continue
        }

        await fs.writeFile(imagePath, response.rawBody)
        if (debug_config.verbose) {
          printInfo(`Image downloaded: ${imageName}`)
        }

        return imageSize / (2 ** 20)
      }
      else {
        assertWarn(!debug_config.verbose, `The status code is not 200: ${response.statusCode}, retrying...`)
      }
    }
    catch (error: any) {
      if (error.name === 'AbortError') {
        assertWarn(!debug_config.show_error, `Download timeout: ${imageName}`)
      }
      else {
        assertWarn(!debug_config.show_error, error.message || 'Unknown error')
      }
      assertWarn(!debug_config.show_error, `This is ${attempt + 1} attempt to download image: ${imageName}`)
      await sleep(download_config.fail_delay)
      if (error.name === 'AbortError') {
        downloadTimeout = Math.min(downloadTimeout * 2, download_config.max_timeout)
      }
    }
  }

  assertWarn(!debug_config.show_error, `Failed to download image: ${imageName}`)
  writeFailLog(`Download failed: ${imageName}, URL: ${url}`)
  return 0
}
