import pLimit from 'p-limit'
import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectKeyword } from '~/collector/selectors.ts'
import { download_config, user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { printInfo } from '~/utils/logMessage.ts'

type OrderType = 'date' | 'date_d'
type ModeType = 'all' | 'safe' | 'r18'

interface IKeywordCrawler {
  keyword: string
  imageNum: number
  order: OrderType
  mode: ModeType
  showAIWorks: boolean
  capacity: number
  downloader: Downloader
  collector: Collector
  collect: (perJsonWorkCount: number) => Promise<void>
  run: () => Promise<number | string[]>
}

export interface KeywordCrawlerOptions {
  keyword: string
  imageNum: number
  order?: OrderType
  mode?: ModeType
  showAIWorks?: boolean
  capacity?: number
}

export class KeywordCrawler implements IKeywordCrawler {
  public keyword: string
  public imageNum: number
  public order: OrderType
  public mode: ModeType
  public showAIWorks: boolean
  public capacity: number
  public downloader: Downloader
  public collector: Collector

  constructor({ keyword, imageNum, order = 'date_d', mode = 'all', showAIWorks = true, capacity = -1 }: KeywordCrawlerOptions) {
    this.keyword = keyword
    this.imageNum = imageNum
    this.order = order
    this.mode = mode
    this.showAIWorks = showAIWorks
    this.capacity = capacity
    this.downloader = new Downloader(capacity)
    this.collector = new Collector(this.downloader)
  }

  async collect(perJsonWorkCount: number = 60) {
    const pageCount = Math.floor((this.imageNum - 1) / perJsonWorkCount) + 1
    printInfo(`========== Start collecting ${this.keyword} ==========`)

    const urls: string[] = []
    const createUrl = (page: number) => (
      `https://www.pixiv.net/ajax/search/artworks/`
      + `${encodeURIComponent(this.keyword)}?${
        [
          `word=${encodeURIComponent(this.keyword)}`,
          `order=${this.order ? 'popular_d' : 'date_d'}`,
          `mode=${this.mode}`,
          `p=${page}`,
          `s_mode=s_tag`,
          `type=all`,
          ...(this.showAIWorks ? [] : [`ai_type=1`]),
          `lang=zh`,
        ].join('&')}`
    )
    for (let i = 1; i <= pageCount; i++) {
      urls.push(createUrl(i))
    }

    const additionalHeaders = { Cookie: user_config.cookie }
    const limit = pLimit(download_config.num_concurrent)
    const tasks = urls.map(url =>
      limit(async () => {
        const imageIds = await collect(url, selectKeyword, additionalHeaders)
        if (imageIds) {
          this.collector.add(imageIds)
        }
      }),
    )
    await Promise.all(tasks)

    printInfo(`========== Finish collecting ${this.keyword} ==========`)
    printInfo(`Number of downloadable artworks: ${this.collector.idGroup.size}`)
  }

  async run() {
    await this.collect()
    await this.collector.collect()
    return await this.downloader.download()
  }
}
