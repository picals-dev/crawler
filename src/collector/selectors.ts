import type { Response } from 'got'
import * as cheerio from 'cheerio'
import { assertError } from '~/utils/logMessage.ts'
import { writeFailLog } from '~/utils/writeFailLog.ts'

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

  try {
    const body = JSON.parse(response.body as string)
    if (!body || !body.body)
      return group
    for (const item of body.body) {
      if (item.urls?.original) {
        group.add(item.urls.original)
      }
    }
  }
  catch (error) {
    assertError(false, `Failed to parse response body: ${error}`)
  }

  return group
}

export function selectUser(response: Response): Set<string> {
  const group = new Set<string>()

  try {
    const body = JSON.parse(response.body as string)
    if (body && body.body) {
      Object.keys(body.body.illusts).forEach(key => group.add(key))
    }
  }
  catch (error) {
    assertError(false, `Failed to parse response body: ${error}`)
  }

  return group
}

export function selectBookmark(response: Response): Set<string> {
  const group = new Set<string>()

  try {
    const body = JSON.parse(response.body as string)
    if (!body || !body.body || !body.body.works)
      return group
    for (const artwork of body.body.works) {
      const workId = artwork.id
      if (typeof workId === 'string') {
        group.add(workId)
      }
      else {
        writeFailLog(`Disabled artwork: ${workId}`)
      }
    }
  }
  catch (error) {
    assertError(false, `Failed to parse response body: ${error}`)
  }

  return group
}

export function selectKeyword(response: Response): Set<string> {
  const group = new Set<string>()

  try {
    const body = JSON.parse(response.body as string)
    if (!body || !body.body || !body.body.illustManga || !body.body.illustManga.data)
      return group
    for (const artwork of body.body.illustManga.data) {
      group.add(artwork.id)
    }
  }
  catch (error) {
    assertError(false, `Failed to parse response body: ${error}`)
  }

  return group
}
