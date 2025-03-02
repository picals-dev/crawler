import { appendFile } from 'node:fs/promises'
import { Mutex } from 'async-mutex'
import dayjs from 'dayjs'

const logMutex = new Mutex()

export async function writeFailLog(text: string, fileName: string = 'failure.log'): Promise<void> {
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const logEntry = `${timestamp} - ${text}\n`

  await logMutex.runExclusive(async () => {
    try {
      await appendFile(fileName, logEntry, 'utf-8')
    }
    catch (error) {
      console.log(`Failed to write to ${fileName}: ${error}`)
    }
  })
}
