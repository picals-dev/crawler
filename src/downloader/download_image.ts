import fs from 'node:fs/promises'
import path from 'node:path'
import { StatusCodes } from 'http-status-codes'
import { client } from '~/client/index.ts'
import { debug_config, download_config, network_config } from '~/configs/index.ts'
import { checkPath } from '~/utils/checkPath.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo, printWarn } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

// 根据 URL 下载图片
export async function downloadImage(url: string, initialTimeout: number = 10000, targetPath: string): Promise<number> {
  // 1. 从 URL 中提取图片名称和图片 ID
  const imageName = url.split('/').pop()
  if (!imageName) {
    handleError(new Error(`Cannot extract image name from URL: ${url}`))
  }
  const regRes = imageName!.match(/(\d+)_/)
  if (!regRes) {
    handleError(new Error(`Bad URL in image downloader: ${url}`))
  }

  // 2. 设置请求头
  const imageId = regRes![1]
  const headers = {
    Referer: `https://www.pixiv.net/artworks/${imageId}`,
    ...network_config.headers,
  }

  if (debug_config.verbose) {
    printInfo(`Downloading image: ${imageName}`)
  }

  await sleep(download_config.start_delay)

  // 3. 检查图片是否已经存在
  const imagePath = path.join(targetPath, imageName!)
  if (debug_config.verbose) {
    printInfo(`当前图片的保存路径为：${imagePath}`)
  }
  const checkPathRes = await checkPath(imagePath)
  if (checkPathRes.exists) {
    printWarn(debug_config.verbose, `Image ${imageName} already exists, skipping...`)
    return 0
  }

  let downloadTimeout = initialTimeout

  for (let attempt = 0; attempt < download_config.retry_times; attempt++) {
    try {
      const controller = new AbortController()
      // 如果下载时间过长则中断下载
      const timeoutId = setTimeout(() => controller.abort(), downloadTimeout)

      const response = await client(url, {
        headers,
        agent: network_config.agent,
        timeout: { connect: download_config.timeout },
        signal: controller.signal,
        retry: { limit: 0 },
      })
      clearTimeout(timeoutId)

      if (response.statusCode === StatusCodes.OK) {
        const imageSize = Number.parseInt(response.headers['content-length'] || '0', 10)

        // 检查图片大小是否正确
        if (imageSize > 0 && response.rawBody.length !== imageSize) {
          printWarn(debug_config.show_error, `Image ${imageName} is incomplete, retrying...`)
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
        printWarn(debug_config.verbose, `The status code is not 200: ${response.statusCode}, retrying...`)
      }
    }
    catch (error: any) {
      if (error.name === 'AbortError') {
        printWarn(debug_config.show_error, `Download timeout: ${imageName}`)
      }
      else {
        printWarn(debug_config.show_error, error.message || 'Unknown error')
      }
      printWarn(debug_config.show_error, `This is ${attempt + 1} attempt to download image: ${imageName}`)
      await sleep(download_config.fail_delay)
      if (error.name === 'AbortError') {
        downloadTimeout = Math.min(downloadTimeout * 2, download_config.max_timeout)
      }
    }
  }

  printWarn(debug_config.show_error, `Failed to download image: ${imageName}`)
  writeFailLog(`Download failed: ${imageName}, URL: ${url}`)
  return 0
}
