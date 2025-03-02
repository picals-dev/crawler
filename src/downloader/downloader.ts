import { download_config } from '~/configs/index.ts'
import { assertError, printInfo } from '~/utils/logMessage.ts'
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
  async download(): Promise<number | string[]> {
    if (download_config.url_only) {
      return Array.from(this.urlGroup)
    }

    let downloadTraffic = 0

    printInfo('========== Downloader start ==========')

    const urlArray = Array.from(this.urlGroup)
    const downloadQueue: Promise<number>[] = []

    for (const url of urlArray) {
      const task = downloadImage(url).then((size) => {
        downloadTraffic += size
        printInfo(`Downloading: ${downloadTraffic.toFixed(2)} MB`)

        if (downloadTraffic > this.capacity) {
          assertError(false, '🚨 Download capacity reached! Stopping further downloads.')
        }

        return size
      })

      downloadQueue.push(task)
    }

    await Promise.allSettled(downloadQueue)

    printInfo('========== Downloading complete ==========')
    return downloadTraffic
  }
}
