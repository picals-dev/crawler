import { error } from 'node:console'
import { StatusCodes } from 'http-status-codes'
import pLimit from 'p-limit'
import { client } from '~/client/index.ts'
import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectBookmark } from '~/collector/selectors.ts'
import { debug_config, download_config, network_config, user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo, printWarn } from '~/utils/logMessage.ts'
import { sleep } from '~/utils/sleep.ts'

interface IBookmarkCrawler {
  imageNum: number
  userId: string
  userUrl: string
  downloader: Downloader
  collector: Collector
  _requestCount: () => Promise<void>
  collect: (perJsonWorkCount: number) => Promise<void>
  run: () => Promise<string[] | number>
}

export interface BookmarkCrawlerOptions {
  imageNum: number
  capacity?: number
}

export class BookmarkCrawler implements IBookmarkCrawler {
  public imageNum: number
  public userId: string
  public userUrl: string
  public downloader: Downloader
  public collector: Collector

  constructor({ imageNum, capacity = -1 }: BookmarkCrawlerOptions) {
    this.imageNum = imageNum
    this.userId = user_config.user_id
    this.userUrl = `https://www.pixiv.net/ajax/user/${this.userId}/illusts`
    this.downloader = new Downloader(capacity)
    this.collector = new Collector(this.downloader)
  }

  async _requestCount() {
    const url = `${this.userUrl}/bookmark/tags?lang=zh`
    printInfo('========== Bookmark crawler start ==========')

    const headers = { ...network_config.headers, Cookie: encodeURIComponent(user_config.cookie) }

    for (let i = 0; i < download_config.retry_times; i++) {
      try {
        const response = await client(url, { headers, agent: network_config.agent, timeout: { connect: download_config.timeout } })

        if (response.statusCode === StatusCodes.OK) {
          const body = typeof response.body === 'object' ? response.body : JSON.parse(response.body as string)
          const totalCount = body.body.public[0].cnt
          this.imageNum = Math.min(this.imageNum, Number.parseInt(totalCount))
          printInfo(`Select ${this.imageNum}/${totalCount} artworks`)
          printInfo('========== Bookmark crawler end ==========')
          return
        }
      }
      catch (error) {
        printWarn(debug_config.show_error, `Failed to request count: ${error}`)
        printWarn(debug_config.show_error, `Retry ${i + 1} times`)
        await sleep(download_config.fail_delay)
      }
    }
    handleError(error, { exit: false, message: 'Please check your cookie configuration' })
    handleError(error, { exit: false, message: '========== Fail to get bookmark count ==========' })
  }

  async collect(perJsonWorkCount: number = 48) {
    const pageCount = Math.ceil((this.imageNum - 1) / perJsonWorkCount)
    printInfo(`========== Start collecting ${this.userId}'s bookmarks ==========`)

    const urls = new Set<string>()
    for (let i = 0; i < pageCount; i++) {
      const url = `${this.userUrl}/bookmarks?tag=&offset=${i * perJsonWorkCount}&limit=${perJsonWorkCount}&rest=show&lang=zh`
      urls.add(url)
      const additionalHeaders = { Cookie: user_config.cookie }

      const limit = pLimit(download_config.num_concurrent)
      const tasks = Array.from(urls).map(url =>
        limit(async () => {
          try {
            const imageIds = await collect(url, selectBookmark, additionalHeaders)
            if (imageIds) {
              this.collector.add(imageIds)
            }
          }
          catch (error) {
            handleError(error, { exit: false, message: `Failed to collect bookmarks: ${error}` })
          }
        }),
      )
      await Promise.all(tasks)
    }

    printInfo(`========== End collecting ${this.userId}'s bookmarks ==========`)
    printInfo(`Total ${this.collector.idGroup.size} bookmarks collected`)
  }

  async run() {
    await this._requestCount()
    await this.collect()
    await this.collector.collect()
    return await this.downloader.download()
  }
}
