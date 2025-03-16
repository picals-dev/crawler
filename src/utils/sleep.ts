/**
 * 创建一个延迟指定时间的 Promise
 *
 * @param {number} delay - 延迟的时间（毫秒），默认为 1000ms
 * @param {AbortSignal} [signal] - 可选的中止信号，用于取消等待
 * @returns {Promise<void>} 一个在指定时间后 resolve 的 Promise
 * @throws {Error} 当传入的 delay 不是正数时抛出错误
 * @throws {DOMException} 当通过 AbortSignal 取消时抛出 "AbortError"
 *
 * @example
 * // 基本用法
 * await sleep(1000); // 暂停执行 1 秒
 *
 * @example
 * // 使用默认值
 * await sleep(); // 默认暂停 1 秒
 *
 * @example
 * // 可取消的延迟
 * const controller = new AbortController();
 * try {
 *   setTimeout(() => controller.abort(), 500); // 500ms 后取消
 *   await sleep(2000, controller.signal); // 尝试等待 2 秒
 *   console.log('这行不会执行，因为等待被取消了');
 * } catch (err) {
 *   console.log('等待被取消了');
 * }
 *
 * @example
 * // 在重试逻辑中使用
 * for (let i = 0; i < retryTimes; i++) {
 *   try {
 *     const result = await someAsyncOperation();
 *     return result;
 *   } catch (error) {
 *     console.warn(`尝试失败，等待后重试: ${error}`);
 *     await sleep(failDelay); // 失败后等待一段时间再重试
 *   }
 * }
 */
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
