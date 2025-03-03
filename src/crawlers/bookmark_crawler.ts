import type { Agents } from 'got'
import got from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { StatusCodes } from 'http-status-codes'
import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectBookmark } from '~/collector/selectors.ts'
import { debug_config, download_config, network_config, user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { assertError, assertWarn, printInfo } from '~/utils/logMessage.ts'

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

export class BookmarkCrawler implements IBookmarkCrawler {
  public imageNum: number
  public userId: string
  public userUrl: string
  public downloader: Downloader
  public collector: Collector

  constructor(imageNum: number, capacity: number = 1024) {
    this.imageNum = imageNum
    this.userId = user_config.user_id
    this.userUrl = `https://www.pixiv.net/ajax/user/${this.userId}/illusts`
    this.downloader = new Downloader(capacity)
    this.collector = new Collector(this.downloader)
  }

  async _requestCount() {
    const url = `${this.userUrl}/bookmark/tags?lang=zh`
    printInfo('========== Bookmark crawler start ==========')

    const headers = { ...network_config.headers, COOKIE: user_config.cookie }

    for (let i = 0; i < download_config.retry_times; i++) {
      try {
        const agent: Agents | undefined = network_config.proxy.http
          ? { http: new HttpProxyAgent({ proxy: network_config.proxy.http }) }
          : network_config.proxy.https
            ? { https: new HttpsProxyAgent({ proxy: network_config.proxy.https }) }
            : undefined

        const response = await got(
          url,
          {
            headers,
            agent,
            timeout: { connect: download_config.timeout },
          },
        )

        if (response.statusCode === StatusCodes.OK) {
        }
      }
      catch (error) {

      }
    }
  }
}
