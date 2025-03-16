import type { BookmarkCrawlerOptions } from './crawlers/bookmark_crawler.ts'
import type { KeywordCrawlerOptions } from './crawlers/keyword_crawler.ts'
import type { UserCrawlerOptions } from './crawlers/user_crawler.ts'
import { BookmarkCrawler } from './crawlers/bookmark_crawler.ts'
import { KeywordCrawler } from './crawlers/keyword_crawler.ts'
import { UserCrawler } from './crawlers/user_crawler.ts'
import { printObj } from './utils/printObj.ts'

/**
 * 下载用户收藏的作品
 *
 * 该函数创建一个书签爬虫实例，用于爬取并下载当前用户收藏的作品。
 * 可以通过参数控制下载的图片数量和下载器容量。
 *
 * @param {object} options - 书签爬虫配置选项
 * @param {number} options.imageNum - 要下载的图片数量
 * @param {number} options.capacity - 最大下载器的容量，单位为 MB，默认为 1024。若不限制容量，则设置为 -1
 * @returns {Promise<void>} 不返回任何值的Promise
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
 * @param {object} options - 用户爬虫配置选项
 * @param {string} options.artistId - 要下载作品的艺术家 ID
 * @param {number} options.capacity - 最大下载器的容量，单位为 MB，默认为 2048。若不限制容量，则设置为 -1
 * @returns {Promise<void>} 不返回任何值的Promise
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
 * @param {object} options - 关键词爬虫配置选项
 * @param {string} options.keyword - 搜索关键词，支持复杂查询语法
 * @param {boolean} options.order - 排序方式，默认为 false
 * @param {string} options.mode - 搜索模式，如 'all'、'safe' 等
 * @param {number} options.imageNum - 要下载的图片数量
 * @param {number} options.capacity - 最大下载器的容量，单位为 MB，默认为 2048。若不限制容量，则设置为 -1
 * @returns {Promise<void>} 不返回任何值的Promise
 */
export async function downloadKeyword({ keyword, order, mode, imageNum, capacity }: KeywordCrawlerOptions): Promise<void> {
  const targetCrawler = new KeywordCrawler({
    keyword,
    order,
    mode,
    imageNum,
    capacity,
  })
  await targetCrawler.run()
}
