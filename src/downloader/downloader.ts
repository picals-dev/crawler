import path from 'node:path'
import pLimit from 'p-limit'
import { debugConfig, downloadConfig } from '~/configs/index.ts'
import { ensurePath } from '~/utils/ensurePath.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo } from '~/utils/logMessage.ts'
import { printObj } from '~/utils/printObj.ts'
import { downloadImage } from './downloadImage.ts'

/**
 * Downloader类的配置
 * @interface
 */
interface DownloaderConfig {
  /** 下载容量，单位为MB。 */
  capacity: number
  /** 要下载的URL组。 */
  urlGroup: Set<string>
}

export class Downloader implements DownloaderConfig {
  /** @inheritdoc */
  public capacity: number
  /** @inheritdoc */
  public urlGroup: Set<string>

  /**
   * 使用提供的下载容量创建Downloader实例。
   *
   * @param capacity - 下载容量，单位为MB。
   */
  constructor(capacity: number) {
    this.capacity = capacity
    this.urlGroup = new Set()
  }

  _collectMultiImageWorks(urls: string[]) {
    const extractWorkId = (url: string) => {
      const match = url.match(/\/(\d+)_p\d+\.[a-z]+$/i)
      return match ? match[1] : null
    }

    const workIdCount: Record<string, number> = {}
    for (const url of urls) {
      const workId = extractWorkId(url)
      if (workId) {
        workIdCount[workId] = (workIdCount[workId] || 0) + 1
      }
    }

    return Object.keys(workIdCount).filter(workId => workIdCount[workId] > 1)
  }

  /**
   * 将URL添加到下载队列中。
   *
   * @param urls - 要添加到下载队列的URL。
   */
  add(urls: string[]): void {
    for (const url of urls) {
      this.urlGroup.add(url)
    }
  }

  /**
   * 从URL组下载图片。
   *
   * @returns 总下载流量，单位为MB。
   */
  async download() {
    if (downloadConfig.urlOnly) {
      return Array.from(this.urlGroup).reverse()
    }

    let downloadTraffic = 0

    printInfo('========== Downloader start ==========')

    const limit = pLimit(downloadConfig.numConcurrent)

    const urls = Array.from(this.urlGroup).reverse()
    if (debugConfig.verbose) {
      printObj(urls, 2, 'Downloading URLs:')
    }

    // 提取出不止包含一张图片的作品 ID
    const worksNeedToDictionary = this._collectMultiImageWorks(urls)

    if (debugConfig.verbose && worksNeedToDictionary.length > 0) {
      printInfo(`找到了 ${worksNeedToDictionary.length} 个包含多张图片的作品`)
    }

    const tasks = urls.map(url =>
      limit(async () => {
        const workId = url.match(/\/(\d+)_p\d+\.[a-z]+$/i)?.[1] ?? ''
        const targetPath = downloadConfig.withDictionary
          ? worksNeedToDictionary.includes(workId)
            ? path.join(downloadConfig.storePath, workId)
            : downloadConfig.storePath
          : downloadConfig.storePath
        await ensurePath(targetPath)
        const imageSize = await downloadImage(url, downloadConfig.maxTimeout, targetPath)
        downloadTraffic += imageSize
        printInfo(`Downloading: ${downloadTraffic.toFixed(2)} MB`)
        if (this.capacity !== -1 && downloadTraffic > this.capacity) {
          handleError(new Error('Download capacity reached! Stopping further downloads.'))
        }
        return imageSize
      }),
    )

    await Promise.allSettled(tasks)

    printInfo('========== Downloading complete ==========')
    return downloadTraffic
  }
}
