import type { Downloader } from '~/downloader/downloader.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import pLimit from 'p-limit'
import { debugConfig, downloadConfig, userConfig } from '~/configs/index.ts'
import { BOOKMARK_URL } from '~/utils/constants.ts'
import { handleError } from '~/utils/handleError.ts'
import { printInfo } from '~/utils/logMessage.ts'
import { collect } from './collectorUnit.ts'
import { selectPage, selectTag } from './selectors.ts'

interface ICollector {
  idGroup: Set<string>
  downloader: Downloader
  add: (imageIds: string[]) => void
  collectTags: (fileName: string) => Promise<void>
  collect: () => Promise<void>
}

export class Collector implements ICollector {
  public idGroup: Set<string>
  public downloader: Downloader

  constructor(initialDownloader: Downloader) {
    this.idGroup = new Set()
    this.downloader = initialDownloader
  }

  add(imageIds: string[]) {
    for (const imageId of imageIds) {
      this.idGroup.add(imageId)
    }
  }

  async collectTags(fileName: string = 'tags.json'): Promise<void> {
    printInfo('========== Tag collector start ==========')

    const tags: Record<string, string[]> = {}
    const additionalHeaders = { Referer: BOOKMARK_URL }

    const artworkIds = Array.from(this.idGroup)
    const urls = artworkIds.map(illustId => ({
      illustId,
      url: `https://www.pixiv.net/artworks/${illustId}`,
    }))

    const limit = pLimit(downloadConfig.numConcurrent)
    const tasks = urls.map(({ illustId, url }) =>
      limit(async () => {
        try {
          const tagList = await collect(url, selectTag, additionalHeaders)
          if (debugConfig.verbose) {
            printInfo(`Tags collected for ${illustId}`)
          }
          return { illustId, tagList }
        }
        catch (error) {
          handleError(error, { exit: false })
          return { illustId, tagList: [] }
        }
      }),
    )
    const results = await Promise.all(tasks)

    for (const { illustId, tagList } of results) {
      if (tagList) {
        tags[illustId] = tagList
      }
    }

    const filePath = path.join(downloadConfig.storePath, fileName)
    await fs.writeFile(filePath, JSON.stringify(tags, null, 2), 'utf-8')

    printInfo('========== Tag collector end ==========')
  }

  async collect() {
    if (downloadConfig.withTag) {
      await this.collectTags()
    }

    printInfo('========== Collector start ==========')
    printInfo('NOTE: An artwork may contain multiple images. The downloader will download all images from the artwork.')

    const artworkIds = Array.from(this.idGroup)
    const urls = artworkIds.map(illustId => ({
      illustId,
      url: `https://www.pixiv.net/ajax/illust/${illustId}/pages?lang=zh`,
    }))
    const additionalHeaders = artworkIds.map(illustId => ({
      'Referer': `https://www.pixiv.net/artworks/${illustId}`,
      'x-user-id': userConfig.userId,
      'Cookie': userConfig.cookie,
    }))

    const limit = pLimit(downloadConfig.numConcurrent)
    const tasks = urls.map(({ illustId, url }, index) =>
      limit(async () => {
        try {
          const imageUrls = await collect(url, selectPage, additionalHeaders[index])
          printInfo(`Collected image urls for artwork ${illustId}`)
          return imageUrls
        }
        catch (error) {
          handleError(error, { exit: false, message: `Failed to collect image urls for artwork ${illustId}: ${error}` })
          return []
        }
      }),
    )

    const results = await Promise.all(tasks)

    for (const imageUrls of results) {
      if (imageUrls) {
        this.downloader.add(imageUrls)
      }
    }

    printInfo('========== Collector complete ==========')
    printInfo(`Number of images: ${this.downloader.urlGroup.size}`)
  }
}
