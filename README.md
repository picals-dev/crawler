## Picals-Crawler

### 介绍

使用 TypeScript 实现的 Pixiv 图片下载器，支持 **下载指定用户的作品** 、 **下载指定关键词搜索的作品** 以及 **用户个人收藏的作品**，并提供高性能的 **并行下载**。

可以直接使用 Bun/Deno/esno/ts-node 等 TS 运行时本地运行，也可以作为 npm 包嵌入到前端应用中进行 GUI 集成。**支持 Tree-Shaking**。

> 该项目的绝大部分灵感来源于 [PixivCrawler](https://github.com/CWHer/PixivCrawler)，一个用 Python 实现的 Pixiv 工具集，在此致谢。

### 下载器

根据不同的下载需求，提供了三种不同的下载器，详情可见 [src/index.ts](./src/index.ts)：

1. downloadBookmark（书签下载器）

   在代码中直接调用 `await downloadBookmark({})` 进行下载。支持配置：

   - `imageNum`：要下载的图片数量，必填。
   - `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

2. downloadUser（用户下载器）

   在代码中直接调用 `await downloadUser({})` 进行下载。支持配置：

   - `artistId`：要下载作品的艺术家 ID，必填。
   - `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

3. downloadKeyword（搜索下载器）

   在代码中直接调用 `await downloadKeyword({})` 进行下载。支持配置：

   - `keyword`：搜索关键词，必填。
   - `imageNum`：要下载的图片数量，必填。
   - `order`：排序方式，选填。可选值为 `date` 或 `date_d`，默认为 `date_d`。
   - `mode`：搜索模式，选填。可选值为 `all`、`safe` 或 `r18`，默认为 `all`。
   - `showAIWorks`：是否显示 AI 作品，选填。可选值为 `true` 或 `false`，默认为 `true`。
   - `capacity`：下载器最大容量限制，单位为 MB。选填，默认为 -1，表示不限制下载最大容量。

### 配置详解

为了灵活地控制下载行为，本项目使用单例模式解耦了下载器与配置，详情可见 [src/configs/index.ts](./src/configs/index.ts)：

1. debug_config（调试配置）

   用于配置调试信息的输出行为。

   | 配置项        | 类型    | 默认值 | 说明                         |
   | ------------- | ------- | ------ | ---------------------------- |
   | `verbose`       | boolean | false  | 是否启用详细日志             |
   | `show_error`    | boolean | false  | 是否显示错误消息             |
   | `show_req_info` | boolean | false  | 是否显示每次请求的详细信息   |
   | `show_res_info` | boolean | false  | 是否显示每次响应的详细信息   |

2. download_config（下载配置）

   用于配置具体的下载行为。

   | 配置项           | 类型    | 默认值           | 说明                             |
   | ---------------- | ------- | ---------------- | -------------------------------- |
   | `timeout`        | number  | 4000             | 请求超时时间（ms）               |
   | `retry_times`    | number  | 10               | 最大重试次数                     |
   | `fail_delay`     | number  | 1000             | 重试延迟（ms）                   |
   | `store_path`     | string  | `'./images'`  | 图片保存路径                     |
   | `with_tag`       | boolean | true             | 是否下载标签到单独的 JSON 文件    |
   | `with_dictionary`| boolean | false            | 是否将多图作品下载到单独的目录中 |
   | `url_only`       | boolean | false            | 只下载作品的 URL                  |
   | `num_concurrent` | number  | 12               | 下载并发数                       |
   | `start_delay`    | number  | 1000             | 启动时等待时间（ms）             |
   | `max_timeout`    | number  | 60000            | 单个请求的最大超时时间（ms）     |

3. network_config（网络配置）

   用于配置网络请求相关的设置。

   | 配置项  | 类型                             | 默认值                                                                                                               | 说明                                               |
   | ------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
   | `proxy` | `{ http?: string, https?: string }` | `{}`                                                                                                                   | 网络请求的代理设置，按协议（http, https）设置 |
   | `headers` | `Record<string, string>`           | `{ 'User-Agent': 'Mozilla/5.0 ...' }` （具体值见代码）                                                                      | 网络请求中包含的 HTTP 头                           |

4. user_config（用户配置）

   用于配置 Pixiv 用户认证信息。

   | 配置项   | 类型   | 默认值 | 说明                                                                     |
   | -------- | ------ | ------ | ------------------------------------------------------------------------ |
   | `user_id`  | string | `''`   | 用户 ID，可在个人资料 URL 中找到（例如 `https://www.pixiv.net/users/xxxx`） |
   | `cookie`   | string | `''`   | 认证 cookie，可通过浏览器开发者工具获取，或为空                            |
   
   > NOTE：Pixiv 的 Cookie 需要通过开发者工具获取。
   >
   > 在 Pixiv 登录后进入 [https://www.pixiv.net/ranking.php](https://www.pixiv.net/ranking.php)，按下 F12 打开开发者工具，切换到 Network 选项卡，选择 Name 为 ranking.php 的选项，在 Headers 中查找 Cookie 字段，将全部字符串复制到 `user_config.cookie` 中即可。
   >
   > ![image-20250504173155468](https://moe.greyflowers.pics/07803dd4260938cb51c4c67c508ff00b_image-20250504173155468.png)

### 使用方式

#### 1. 本地运行

1. 在本地运行前，请确保您的计算机中：
   1. 已经安装了 [Node.js](https://nodejs.org/en)。
   2. 已经安装了 [pnpm](https://pnpm.io/)。
   3. 正确配置了 TypeScript 运行时环境。**建议使用 [Bun](https://bun.sh/)**。

2. 将该仓库 clone 到您想要放置的目录。

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

#### 2. npm 包嵌入前端应用

1. 在项目中安装本项目：

```bash
pnpm add @hana/pixiv-crawler
```

2. 在项目中引入导出的下载器与配置：

```ts
import { downloadBookmark, downloadUser, downloadKeyword } from 'picals-crawler'
```

3. 根据需要进行配置：

```ts
download_config.store_path = './downloads'
```

4. 使用下载器进行下载：

```ts
await downloadBookmark({ imageNum: 10, capacity: 1024 })
```
