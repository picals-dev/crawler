import chalk from 'chalk'

export function printInfo(msg: string): void {
  console.log(chalk.green(`[INFO]: ${msg}`))
}

export function assertWarn(expr: boolean, msg: string): void {
  if (!expr) {
    chalk.bold.yellow(`[WARN]: ${msg}`)
  }
}

export function assertError(expr: boolean, msg: string): void {
  if (!expr) {
    throw new Error(`[ERROR]: ${msg}`)
  }
}
