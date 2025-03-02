import { download_config } from '~/configs/index.ts'
import { assertError, printInfo } from '~/utils/logMessage.ts'
import { downloadImage } from './download_image.ts'

interface DownloaderConfig {
  /** The download capacity in MB. */
  capacity: number
  /** The url group to download. */
  urlGroup: Set<string>
}

export class Downloader implements DownloaderConfig {
  public capacity: number
  public urlGroup: Set<string>

  constructor(capacity: number) {
    this.capacity = capacity
    this.urlGroup = new Set()
  }

  add(urls: string[]): void {
    for (const url of urls) {
      this.urlGroup.add(url)
    }
  }

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

    await Promise.allSettled(downloadQueue) // 确保所有下载任务都执行

    printInfo('========== Downloading complete ==========')
    return downloadTraffic
  }
}
