import chalk from 'chalk'

export function printObj<T extends Record<string, any>>(item: T, indentation: number = 2, headerMsg?: string): void {
  if (headerMsg) {
    console.log(chalk.bold.green(headerMsg))
  }

  const indentStr = ' '.repeat(indentation)
  const seen = new WeakSet<any>()

  function printValue(key: string, value: any, currentIndent: string): void {
    if (value && typeof value === 'object') {
      if (seen.has(value)) {
        console.log(`${currentIndent}${chalk.cyan(key)}: ${chalk.red('[Circular]')}`)
        return
      }
      seen.add(value)

      if (Array.isArray(value)) {
        console.log(`${currentIndent}${chalk.cyan(key)}: [`)
        value.forEach((elem, index) => {
          if (elem && typeof elem === 'object') {
            printValue(String(index), elem, currentIndent + indentStr)
          }
          else {
            console.log(`${currentIndent + indentStr}${chalk.yellow(elem)}`)
          }
        })
        console.log(`${currentIndent}]`)
      }
      else {
        console.log(`${currentIndent}${chalk.cyan(key)}:`)
        Object.entries(value).forEach(([subKey, subValue]) => {
          printValue(subKey, subValue, currentIndent + indentStr)
        })
      }
    }
    else {
      console.log(`${currentIndent}${chalk.cyan(key)}: ${chalk.yellow(value)}`)
    }
  }

  if (!item || typeof item !== 'object') {
    console.log(chalk.yellow(item))
    return
  }

  Object.entries(item).forEach(([key, value]) => {
    printValue(key, value, '')
  })
}
