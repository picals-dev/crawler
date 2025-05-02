import process from 'node:process'
import chalk from 'chalk'

interface HandleErrorOptions {
  /** 是否退出进程，默认 true */
  exit?: boolean
  /** 自定义错误信息，覆盖 error.message */
  message?: string
  /** 退出码，默认 1 */
  code?: number
  /** 自定义前置消息内容，如：The error message is:  */
  prefix?: string
}

export function handleError(
  err: unknown,
  options: HandleErrorOptions = {},
): void {
  const {
    exit = true,
    code = 1,
    prefix,
    message: customMessage,
  } = options

  const message = customMessage || (
    err instanceof Error
      ? (err.stack || err.message)
      : typeof err === 'string'
        ? err
        : JSON.stringify(err)
  )

  console.error(chalk.red(`[ERROR]: ${prefix}${message}`))

  if (exit) {
    process.exit(code)
  }
}
