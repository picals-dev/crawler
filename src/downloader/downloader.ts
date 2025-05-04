import path from 'node:path'
import pLimit from 'p-limit'
import { debug_config, download_config } from '~/configs/index.ts'
import { ensurePath } from '~/utils/ensurePath.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo } from '~/utils/logMessage.ts'
import { printObj } from '~/utils/printObj.ts'
import { downloadImage } from './download_image.ts'

/**
 * Configuration for the Downloader class
 * @interface
 */
interface DownloaderConfig {
  /** The download capacity in MB. */
  capacity: number
  /** The url group to download. */
  urlGroup: Set<string>
}

export class Downloader implements DownloaderConfig {
  /** @inheritdoc */
  public capacity: number
  /** @inheritdoc */
  public urlGroup: Set<string>

  /**
   * Creates an instance of Downloader with the provided download capacity.
   *
   * @param capacity - The download capacity in MB.
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
   * Add URLs to the download queue.
   *
   * @param urls - URLs to add to the download queue.
   */
  add(urls: string[]): void {
    for (const url of urls) {
      this.urlGroup.add(url)
    }
  }

  /**
   * Download images from the URL group.
   *
   * @returns The total download traffic in MB.
   */
  async download() {
    if (download_config.url_only) {
      return Array.from(this.urlGroup).reverse()
    }

    let downloadTraffic = 0

    printInfo('========== Downloader start ==========')

    const limit = pLimit(download_config.num_concurrent)

    const urls = Array.from(this.urlGroup).reverse()
    if (debug_config.verbose) {
      printObj(urls, 2, 'Downloading URLs:')
    }

    // 提取出不止包含一张图片的作品 ID
    const worksNeedToDictionary = this._collectMultiImageWorks(urls)

    if (debug_config.verbose && worksNeedToDictionary.length > 0) {
      printInfo(`找到了 ${worksNeedToDictionary.length} 个包含多张图片的作品`)
    }

    const tasks = urls.map(url =>
      limit(async () => {
        const workId = url.match(/\/(\d+)_p\d+\.[a-z]+$/i)?.[1] ?? ''
        const targetPath = download_config.with_dictionary
          ? worksNeedToDictionary.includes(workId)
            ? path.join(download_config.store_path, workId)
            : download_config.store_path
          : download_config.store_path
        await ensurePath(targetPath)
        const imageSize = await downloadImage(url, download_config.max_timeout, targetPath)
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
