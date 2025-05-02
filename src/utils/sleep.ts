// 创建一个延迟指定时间的 Promise
export function sleep(delay: number = 1000, signal?: AbortSignal): Promise<void> {
  if (delay < 0 || !Number.isFinite(delay)) {
    throw new Error('延迟时间必须是一个正数')
  }

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('等待操作被取消', 'AbortError'))
    }

    const timer = setTimeout(resolve, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new DOMException('等待操作被取消', 'AbortError'))
      }, { once: true })
    }
  })
}
