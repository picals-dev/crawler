import type { BookmarkCrawlerOptions } from './crawlers/bookmarkCrawler.ts'
import type { KeywordCrawlerOptions } from './crawlers/keywordCrawler.ts'
import type { UserCrawlerOptions } from './crawlers/userCrawler.ts'
import { BookmarkCrawler } from './crawlers/bookmarkCrawler.ts'
import { KeywordCrawler } from './crawlers/keywordCrawler.ts'
import { UserCrawler } from './crawlers/userCrawler.ts'
import { printObj } from './utils/printObj.ts'

/**
 * 下载用户收藏的作品
 *
 * 该函数创建一个书签爬虫实例，用于爬取并下载当前用户收藏的作品。
 * 可以通过参数控制下载的图片数量和下载器容量。
 *
 * @param options - 书签爬虫配置选项
 * @param options.imageNum - 要下载的图片数量
 * @param options.capacity - 最大下载器的容量，单位为 MB，若为 -1，则不限制容量。默认为 -1。
 */
export async function downloadBookmark({ imageNum, capacity }: BookmarkCrawlerOptions): Promise<void> {
  const targetCrawler = new BookmarkCrawler({ imageNum, capacity })
  await targetCrawler.run()
}

/**
 * 下载指定用户的所有作品
 *
 * 该函数创建一个用户爬虫实例，用于爬取并下载指定艺术家 ID 的所有作品。
 * 如果下载成功，将在控制台输出下载的文件路径列表。
 *
 * @param options - 用户爬虫配置选项
 * @param options.artistId - 要下载作品的艺术家 ID
 * @param options.capacity - 最大下载器的容量，单位为 MB，若为 -1，则不限制容量。默认为 -1。
 */
export async function downloadUser({ artistId, capacity }: UserCrawlerOptions): Promise<void> {
  const targetCrawler = new UserCrawler({ artistId, capacity })
  const res = await targetCrawler.run()

  // 如果 res 是数组，则打印
  if (Array.isArray(res)) {
    printObj(res, 2, 'Downloaded images:')
  }
}

/**
 * 根据关键词下载作品
 *
 * 该函数创建一个关键词爬虫实例，用于爬取并下载符合特定关键词条件的作品。
 * 可以通过参数控制关键词、排序方式、模式、下载数量和下载器容量。
 *
 * @param options - 关键词爬虫配置选项
 * @param options.keyword - 搜索关键词，支持复杂查询语法
 * @param options.imageNum - 要下载的图片数量
 * @param options.order - 排序方式。'date' 表示按旧排序，'date_d' 表示按最新排序
 * @param options.mode - 搜索模式，'all' 表示全部，'safe' 表示安全，'r18' 表示 R-18
 * @param options.showAIWorks - 是否查询 AI 作品，默认为 true
 * @param options.capacity - 最大下载器的容量，单位为 MB，若为 -1，则不限制容量。默认为 -1。
 */
export async function downloadKeyword({ keyword, imageNum, order, mode, showAIWorks, capacity }: KeywordCrawlerOptions): Promise<void> {
  const targetCrawler = new KeywordCrawler({
    keyword,
    imageNum,
    order,
    mode,
    showAIWorks,
    capacity,
  })
  await targetCrawler.run()
}

export * from './configs/index.ts'
