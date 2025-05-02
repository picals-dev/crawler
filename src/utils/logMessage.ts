import chalk from 'chalk'

export function printInfo(msg: string) {
  console.log(chalk.blue(`[INFO]: ${msg}`))
}

export function printWarn(enable: boolean, msg: string) {
  if (enable) {
    console.warn(chalk.bold.yellow(`[WARN]: ${msg}`))
  }
}
