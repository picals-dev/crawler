import pLimit from 'p-limit'
import { download_config } from '~/configs/index.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo } from '~/utils/logMessage.ts'
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
    const tasks = urls.map(url =>
      limit(async () => {
        const imageSize = await downloadImage(url)
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
