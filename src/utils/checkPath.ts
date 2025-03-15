import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

interface PathCheckResult {
  exists: boolean
  isFile: boolean
  isDirectory: boolean
}

export async function checkPath(dirPath: string): Promise<PathCheckResult> {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath)

  try {
    const stats = await fs.stat(absolutePath)
    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    }
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { exists: false, isFile: false, isDirectory: false }
    }
    throw error
  }
}
