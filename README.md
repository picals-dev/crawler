## Picals-Crawler

[![NPM Version](https://img.shields.io/npm/v/@hana/picals-crawler.svg)](https://www.npmjs.com/package/@hana/picals-crawler)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)

### 介绍

使用 TypeScript 实现的 Pixiv 图片下载器，支持 **下载指定用户的作品** 、 **下载指定关键词搜索的作品** 以及 **下载用户个人收藏的作品**，并提供高性能的 **并行下载**。

可以直接使用 Bun/Deno/esno/ts-node 等 TS 运行时本地运行，也可以作为 npm 包嵌入到前端应用中进行 GUI 集成。**支持 Tree-Shaking**。

> 该项目的绝大部分灵感来源于 [PixivCrawler](https://github.com/CWHer/PixivCrawler)，一个用 Python 实现的 Pixiv 工具集，在此致谢。

### 安装

在项目中安装 @hana/picals-crawler：

```bash
# 使用 npm
npm install @hana/picals-crawler

# 使用 yarn
yarn add @hana/picals-crawler

# 使用 pnpm（推荐）
pnpm add @hana/picals-crawler
```

### 前提条件

- Node.js >= 18.0
- 能够访问 Pixiv 的网络环境（国内用户可能需要配置代理，若代理工具支持 TUN 模式则无需配置）

### 快速开始

1. 在项目中引入导出的下载器与配置：

```ts
import { 
  downloadBookmark, 
  downloadUser, 
  downloadKeyword, 
  user_config, 
  network_config, 
  download_config 
} from '@hana/picals-crawler'
```

2. 设置必要的配置信息：

```ts
// 用户信息配置
user_config.user_id = '你的用户ID'
user_config.cookie = '你的Cookie字符串'  // 可选，但部分功能需要

// 如果需要代理
network_config.proxy = {
  http: 'http://127.0.0.1:7890',
  https: 'http://127.0.0.1:7890'
}

// 下载配置
download_config.store_path = './downloads'  // 设置下载目录
```

3. 使用下载器下载内容：

```ts
// 下载用户作品
await downloadUser({ artistId: '12345678' })

// 下载个人收藏
await downloadBookmark({ imageNum: 100 })

// 下载搜索结果
await downloadKeyword({ 
  keyword: '初音ミク', 
  imageNum: 50,
  mode: 'safe' 
})
```

### 下载器

根据不同的下载需求，提供了三种不同的下载器，详情可见 [src/index.ts](./src/index.ts)：

#### downloadBookmark（书签下载器）

在代码中直接调用 `await downloadBookmark({})` 进行下载。支持配置：

- `imageNum`：要下载的图片数量，必填。
- `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

#### downloadUser（用户下载器）

在代码中直接调用 `await downloadUser({})` 进行下载。支持配置：

- `artistId`：要下载作品的艺术家 ID，必填。
- `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

#### downloadKeyword（搜索下载器）

在代码中直接调用 `await downloadKeyword({})` 进行下载。支持配置：

- `keyword`：搜索关键词，必填。
- `imageNum`：要下载的图片数量，必填。
- `order`：排序方式，选填。可选值为 `date`（按日期升序）或 `date_d`（按日期降序），默认为 `date_d`。
- `mode`：搜索模式，选填。可选值为 `all`、`safe` 或 `r18`，默认为 `all`。
- `showAIWorks`：是否显示 AI 作品，选填。可选值为 `true` 或 `false`，默认为 `true`。
- `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

### 配置详解

为了灵活地控制下载行为，本项目使用单例模式解耦了下载器与配置，详情可见 [src/configs/index.ts](./src/configs/index.ts)：

#### debug_config（调试配置）

用于配置调试信息的输出行为。

| 配置项        | 类型    | 默认值 | 说明                         |
| ------------- | ------- | ------ | ---------------------------- |
| `verbose`       | boolean | false  | 是否启用详细日志             |
| `show_error`    | boolean | false  | 是否显示错误消息             |
| `show_req_info` | boolean | false  | 是否显示每次请求的详细信息   |
| `show_res_info` | boolean | false  | 是否显示每次响应的详细信息   |

#### download_config（下载配置）

用于配置具体的下载行为。

| 配置项           | 类型    | 默认值        | 说明                             |
| ---------------- | ------- | ------------- | -------------------------------- |
| `timeout`        | number  | 4000          | 请求超时时间（ms）               |
| `retry_times`    | number  | 10            | 最大重试次数                     |
| `fail_delay`     | number  | 1000          | 重试延迟（ms）                   |
| `store_path`     | string  | `./images`    | 图片保存路径                     |
| `with_tag`       | boolean | true          | 是否下载标签到单独的 JSON 文件   |
| `with_dictionary`| boolean | false         | 是否将多图作品下载到单独的目录中 |
| `url_only`       | boolean | false         | 只下载作品的 URL                 |
| `num_concurrent` | number  | 12            | 下载并发数                       |
| `start_delay`    | number  | 1000          | 启动时等待时间（ms）             |
| `max_timeout`    | number  | 60000         | 单个请求的最大超时时间（ms）     |

#### network_config（网络配置）

用于配置网络请求相关的设置。

| 配置项    | 类型                             | 默认值                                                | 说明                                |
| --------- | -------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `proxy`   | `{ http?: string, https?: string }` | `{}`                                                  | 网络请求的代理设置，按协议设置      |
| `headers` | `Record<string, string>`         | `{ 'User-Agent': 'Mozilla/5.0 ...' }` （具体值见代码） | 网络请求中包含的 HTTP 头            |

#### user_config（用户配置）

用于配置 Pixiv 用户认证信息。

| 配置项    | 类型   | 默认值 | 说明                                                                     |
| --------- | ------ | ------ | ------------------------------------------------------------------------ |
| `user_id` | string | `''`   | 用户 ID，可在个人资料 URL 中找到（例如 `https://www.pixiv.net/users/xxxx`） |
| `cookie`  | string | `''`   | 认证 cookie，可通过浏览器开发者工具获取，或为空                            |

> **注意**：Pixiv 的 Cookie 需要通过开发者工具获取。
>
> 在 Pixiv 登录后进入 [https://www.pixiv.net/ranking.php](https://www.pixiv.net/ranking.php)，按下 F12 打开开发者工具，切换到 Network 选项卡，选择 Name 为 ranking.php 的选项，在 Headers 中查找 Cookie 字段，将全部字符串复制到 `user_config.cookie` 中即可。
>
> ![获取Cookie示例](https://moe.greyflowers.pics/07803dd4260938cb51c4c67c508ff00b_image-20250504173155468.png)

### 使用示例

#### 基本例子

```ts
import { 
  debug_config, 
  download_config, 
  downloadUser, 
  network_config, 
  user_config, 
  displayAllConfigs 
} from '@hana/picals-crawler'

async function main() {
  // 配置网络代理（如果需要）
  network_config.proxy = {
    http: 'http://127.0.0.1:7890',
    https: 'http://127.0.0.1:7890'
  }

  // 开启详细日志
  debug_config.verbose = true
  debug_config.show_error = true
  debug_config.show_res_info = false

  // 设置用户信息
  user_config.user_id = '123456'
  user_config.cookie = `你的cookie字符串`

  // 配置下载行为
  download_config.store_path = 'images/123456'
  download_config.with_tag = false
  download_config.with_dictionary = true

  // 显示当前所有配置（可选）
  displayAllConfigs()

  // 下载指定用户的作品
  await downloadUser({ artistId: '123456' })
}

main().catch(err => console.error('下载过程中发生错误:', err))
```

#### 在浏览器应用中使用

虽然该库主要设计用于 Node.js 环境，但通过适当的打包工具（如 Webpack、Vite 等），也可以在浏览器环境中使用。需要注意的是，由于浏览器的安全限制和同源策略，你可能需要设置代理服务器或 CORS 来解决跨域问题。

```ts
// React组件示例
import React, { useState } from 'react'
import { downloadKeyword, download_config } from '@hana/picals-crawler'

const PixivDownloader = () => {
  const [keyword, setKeyword] = useState('')
  const [downloading, setDownloading] = useState(false)
  
  const handleDownload = async () => {
    setDownloading(true)
    try {
      // 在实际应用中，你可能需要一个后端API来处理下载
      // 这里仅作为示例
      await downloadKeyword({
        keyword,
        imageNum: 20,
        mode: 'safe'
      })
      alert('下载完成!')
    } catch (err) {
      console.error(err)
      alert('下载失败')
    } finally {
      setDownloading(false)
    }
  }
  
  return (
    <div>
      <input 
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="输入搜索关键词"
      />
      <button onClick={handleDownload} disabled={downloading}>
        {downloading ? '下载中...' : '开始下载'}
      </button>
    </div>
  )
}

export default PixivDownloader
```

### 开发指南

如果你想要参与开发或在本地运行测试，请按照以下步骤操作：

1. 在本地运行前，请确保您的计算机中：
   1. 已经安装了 [Node.js](https://nodejs.org/en) (v18.0+)
   2. 已经安装了 [pnpm](https://pnpm.io/)
   3. 正确配置了 TypeScript 运行时环境。**建议使用 [Bun](https://bun.sh/)**

2. 将该仓库 clone 到您想要放置的目录：

```bash
git clone git@github.com:picals-dev/crawler.git
```

3. 进入项目目录并安装依赖：

```bash
cd crawler && pnpm install
```

4. 打开 `main.ts` 文件，根据自己的实际需要进行详细的下载配置与下载器选择。

5. 运行 `main.ts` 文件：

```bash
bun main.ts
```

### API 参考

#### 下载器函数

```ts
/**
 * 下载用户个人收藏
 * @param options 下载选项
 * @returns Promise<void>
 */
async function downloadBookmark(options: {
  imageNum: number;
  capacity?: number;
}): Promise<void>;

/**
 * 下载指定用户的作品
 * @param options 下载选项
 * @returns Promise<void>
 */
async function downloadUser(options: {
  artistId: string;
  capacity?: number;
}): Promise<void>;

/**
 * 下载搜索结果
 * @param options 下载选项
 * @returns Promise<void>
 */
async function downloadKeyword(options: {
  keyword: string;
  imageNum: number;
  order?: 'date' | 'date_d';
  mode?: 'all' | 'safe' | 'r18';
  showAIWorks?: boolean;
  capacity?: number;
}): Promise<void>;
```

#### 配置对象

```ts
// 调试配置
const debug_config: {
  verbose: boolean;
  show_error: boolean;
  show_req_info: boolean;
  show_res_info: boolean;
};

// 下载配置
const download_config: {
  timeout: number;
  retry_times: number;
  fail_delay: number;
  store_path: string;
  with_tag: boolean;
  with_dictionary: boolean;
  url_only: boolean;
  num_concurrent: number;
  start_delay: number;
  max_timeout: number;
};

// 网络配置
const network_config: {
  proxy: {
    http?: string;
    https?: string;
  };
  headers: Record<string, string>;
};

// 用户配置
const user_config: {
  user_id: string;
  cookie: string;
};

// 显示所有配置的辅助函数
function displayAllConfigs(): void;
```

#### Bug 报告与功能请求

如果你发现了 Bug 或者有新功能需求，请通过 GitHub Issues 提交，并尽可能详细地描述问题或需求。

### 许可证

[MIT](./LICENSE)
