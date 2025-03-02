import fs from 'node:fs/promises'
import path from 'node:path'

interface PathCheckResult {
  exists: boolean
  isFile: boolean
  isDirectory: boolean
}

export async function checkPath(dirPath: string): Promise<PathCheckResult> {
  if (!path.isAbsolute(dirPath)) {
    throw new Error('The path must be absolute')
  }

  try {
    const stats = await fs.stat(dirPath)
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
