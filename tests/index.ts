import fs from 'node:fs/promises'

// 创建一个简单的 demo.txt 文件
async function createDemoFile() {
  await fs.writeFile('images/demo.txt', 'Hello, world!')
}

// 读取 demo.txt 文件
async function readDemoFile() {
  const res = await fs.readFile('images/demo.txt', 'utf-8')
  console.log(res)
}

createDemoFile()
readDemoFile()
