import chalk from 'chalk'

/**
 * 将对象以彩色格式化的方式打印到控制台。
 *
 * 此函数递归地遍历对象的属性，并以树状结构显示它们，使用不同的颜色区分键和值。
 * 它能够处理嵌套对象、数组和循环引用。
 *
 * @template T - 对象类型，必须是键为字符串的记录类型
 * @param {T} item - 要打印的对象
 * @param {number} indentation - 每级缩进的空格数，默认为2
 * @param {string} [headerMsg] - 可选的标题消息，将以绿色粗体显示在对象内容之前
 *
 * @example
 * // 打印配置对象
 * printObj(userConfig, 2, 'User Configuration:');
 *
 * @example
 * // 打印嵌套对象
 * printObj({
 *   name: 'Example',
 *   settings: {
 *     enabled: true,
 *     options: [1, 2, 3]
 *   }
 * });
 *
 * @returns {void} 此函数不返回值，直接将格式化后的对象打印到控制台
 */
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
