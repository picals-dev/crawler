import { printInfo } from './logMessage.ts'

export function timerLogger<T extends (...args: any[]) => any>(func: T): T {
  return function (...args: Parameters<T>): ReturnType<T> {
    const startTime = performance.now()
    const result = func(...args)

    if (result instanceof Promise) {
      return result.then((res) => {
        printInfo(`${func.name}() finishes after ${(performance.now() - startTime).toFixed(2)} ms`)
        return res
      }) as ReturnType<T>
    }
    else {
      printInfo(`${func.name}() finishes after ${(performance.now() - startTime).toFixed(2)} ms`)
      return result
    }
  } as T
}
