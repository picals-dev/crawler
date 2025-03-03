import got from 'got'
import { writeFailLog } from '~/utils/writeFailLog.ts'

const TEST_URL = 'https://www.pixiv.net/en/artworks/121154856'

const response = got(TEST_URL)

response.then((res) => {
  writeFailLog(res.body)
})
