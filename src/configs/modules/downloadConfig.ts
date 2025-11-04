import { DEFAULT_STORE_PATH } from '~/utils/constants.ts'

/**
 * 配置下载图像的选项。
 * @interface
 */
interface DownloadConfigOptions {
  /** 请求超时时间（ms） */
  timeout?: number
  /** 最大重试次数 */
  retryTimes?: number
  /** 重试延迟（ms） */
  failDelay?: number
  /** 图片保存路径 */
  storePath?: string
  /** 是否下载标签到单独的 JSON 文件 */
  withTag?: boolean
  /** 是否将多图作品下载到单独的目录中 */
  withDictionary?: boolean
  /** 只下载作品的 URL */
  urlOnly?: boolean
  /** 下载并发数 */
  numConcurrent?: number
  /** 启动时等待时间（ms） */
  startDelay?: number
  /** 单个请求的最大超时时间（ms） */
  maxTimeout?: number
}

const DEFAULT_DOWNLOAD_CONFIG: Required<DownloadConfigOptions> = {
  timeout: 4000,
  retryTimes: 10,
  failDelay: 1000,
  storePath: DEFAULT_STORE_PATH,
  withTag: true,
  withDictionary: false,
  urlOnly: false,
  numConcurrent: 12,
  startDelay: 1000,
  maxTimeout: 60000,
}

/**
 * 表示用于下载图像的配置选项。
 * 封装了超时、重试、存储和并行下载的设置。
 *
 * @class
 * @implements {DownloadConfigOptions}
 */
export class DownloadConfig implements DownloadConfigOptions {
  /** @inheritdoc */
  public timeout: number
  /** @inheritdoc */
  public retryTimes: number
  /** @inheritdoc */
  public failDelay: number
  /** @inheritdoc */
  public storePath: string
  /** @inheritdoc */
  public withTag: boolean
  /** @inheritdoc */
  public withDictionary: boolean
  /** @inheritdoc */
  public urlOnly: boolean
  /** @inheritdoc */
  public numConcurrent: number
  /** @inheritdoc */
  public startDelay: number
  /** @inheritdoc */
  public maxTimeout: number

  /**
   * 创建一个 DownloadConfig 实例，并使用提供的选项配置。
   *
   * @param {DownloadConfigOptions} options - 包含下载设置的配置选项。
   */
  constructor(options: DownloadConfigOptions = {}) {
    this.timeout = options.timeout ?? DEFAULT_DOWNLOAD_CONFIG.timeout
    this.retryTimes = options.retryTimes ?? DEFAULT_DOWNLOAD_CONFIG.retryTimes
    this.failDelay = options.failDelay ?? DEFAULT_DOWNLOAD_CONFIG.failDelay
    this.storePath = options.storePath ?? DEFAULT_DOWNLOAD_CONFIG.storePath
    this.withTag = options.withTag ?? DEFAULT_DOWNLOAD_CONFIG.withTag
    this.withDictionary = options.withDictionary ?? DEFAULT_DOWNLOAD_CONFIG.withDictionary
    this.urlOnly = options.urlOnly ?? DEFAULT_DOWNLOAD_CONFIG.urlOnly
    this.numConcurrent = options.numConcurrent ?? DEFAULT_DOWNLOAD_CONFIG.numConcurrent
    this.startDelay = options.startDelay ?? DEFAULT_DOWNLOAD_CONFIG.startDelay
    this.maxTimeout = options.maxTimeout ?? DEFAULT_DOWNLOAD_CONFIG.maxTimeout
  }
}
