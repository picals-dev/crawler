import pLimit from 'p-limit'
import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectBookmark } from '~/collector/selectors.ts'
import { download_config, user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo } from '~/utils/logMessage.ts'

interface IBookmarkCrawler {
  imageNum: number
  userId: string
  userUrl: string
  downloader: Downloader
  collector: Collector
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

  async collect(perJsonWorkCount: number = 48) {
    const pageCount = Math.ceil(this.imageNum / perJsonWorkCount)
    printInfo(`========== Start collecting ${this.userId}'s bookmarks ==========`)

    const urls = new Set<string>()
    for (let i = 0; i < pageCount; i++) {
      const url = `${
        this.userUrl
      }/bookmarks?tag=&offset=${
        i * perJsonWorkCount
      }&limit=${
        Math.min(perJsonWorkCount, this.imageNum - i * perJsonWorkCount)
      }&rest=show&lang=zh`
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
    await this.collect()
    await this.collector.collect()
    return await this.downloader.download()
  }
}
