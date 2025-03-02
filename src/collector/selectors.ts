import type { Response } from 'got'
import * as cheerio from 'cheerio'
import { assertError } from '~/utils/logMessage.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

/**
 * Collect all tags from (artwork.html)
 *
 * @param response - The response object from the request
 */
export function selectTag(response: Response): string[] {
  const match = response.url.match(/artworks\/(\d+)/)
  if (!match) {
    assertError(false, `Bad response in selectTag for URL: ${response.url}`)
  }

  const workId = match![1]

  const $ = cheerio.load(response.body as string)
  const metaContent = $('#meta-preload-data').attr('content')
  if (!metaContent) {
    assertError(false, `Cannot find meta content in selectTag for URL: ${response.url}`)
  }
  const content = JSON.parse(metaContent!)
  const tagsData = content.illust[workId].tags.tags

  return tagsData.map((tag: any) => tag.translation ? tag.translation.en : tag.tag)
}

export function selectPage(response: Response): Set<string> {
  const group = new Set<string>()
}
