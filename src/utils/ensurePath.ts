import fs from 'node:fs/promises'
import { checkPath } from './checkPath.ts'

export async function ensurePath(path: string) {
  const checkPathRes = await checkPath(path)
  if (!checkPathRes.exists) {
    await fs.mkdir(path, { recursive: true })
  }
}
