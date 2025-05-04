import { Collector } from '~/collector/collector.ts'
import { collect } from '~/collector/collector_unit.ts'
import { selectUser } from '~/collector/selectors.ts'
import { user_config } from '~/configs/index.ts'
import { Downloader } from '~/downloader/downloader.ts'
import { printInfo } from '~/utils/logMessage.ts'

interface IUserCrawler {
  artistId: string
  downloader: Downloader
  collector: Collector
  collect: () => Promise<void>
  run: () => Promise<string[] | number>
}

export interface UserCrawlerOptions {
  artistId: string
  capacity?: number
}

export class UserCrawler implements IUserCrawler {
  public artistId: string
  public downloader: Downloader
  public collector: Collector

  constructor({ artistId, capacity = -1 }: UserCrawlerOptions) {
    this.artistId = artistId
    this.downloader = new Downloader(capacity)
    this.collector = new Collector(this.downloader)
  }

  async collect() {
    printInfo(`========== Collecting user ${this.artistId}'s works ==========`)
    const artistUrl = `https://www.pixiv.net/ajax/user/${this.artistId}/profile/all?lang=zh`
    const additionalHeaders = {
      'Referer': `https://www.pixiv.net/users/${this.artistId}/illustrations`,
      'x-user-id': user_config.user_id,
      'Cookie': user_config.cookie,
    }
    const imageIds = await collect(artistUrl, selectUser, additionalHeaders)
    if (imageIds) {
      this.collector.add(imageIds)
    }
    printInfo(`========== Collected user ${this.artistId}'s works ==========`)
  }

  async run() {
    await this.collect()
    await this.collector.collect()
    return await this.downloader.download()
  }
}
