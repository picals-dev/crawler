import { DEFAULT_STORE_PATH } from '~/utils/constants.ts'

/**
 * 配置下载图像的选项。
 * @interface
 */
interface DownloadConfigOptions {
  /** 请求超时时间（ms） */
  timeout?: number
  /** 最大重试次数 */
  retry_times?: number
  /** 重试延迟（ms） */
  fail_delay?: number
  /** 图片保存路径 */
  store_path?: string
  /** 是否下载标签到单独的 JSON 文件 */
  with_tag?: boolean
  /** 是否将多图作品下载到单独的目录中 */
  with_dictionary?: boolean
  /** 只下载作品的 URL */
  url_only?: boolean
  /** 下载并发数 */
  num_concurrent?: number
  /** 启动时等待时间（ms） */
  start_delay?: number
  /** 单个请求的最大超时时间（ms） */
  max_timeout?: number
}

const DEFAULT_DOWNLOAD_CONFIG: Required<DownloadConfigOptions> = {
  timeout: 4000,
  retry_times: 10,
  fail_delay: 1000,
  store_path: DEFAULT_STORE_PATH,
  with_tag: true,
  with_dictionary: false,
  url_only: false,
  num_concurrent: 12,
  start_delay: 1000,
  max_timeout: 60000,
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
  public retry_times: number
  /** @inheritdoc */
  public fail_delay: number
  /** @inheritdoc */
  public store_path: string
  /** @inheritdoc */
  public with_tag: boolean
  /** @inheritdoc */
  public with_dictionary: boolean
  /** @inheritdoc */
  public url_only: boolean
  /** @inheritdoc */
  public num_concurrent: number
  /** @inheritdoc */
  public start_delay: number
  /** @inheritdoc */
  public max_timeout: number

  /**
   * 创建一个 DownloadConfig 实例，并使用提供的选项配置。
   *
   * @param {DownloadConfigOptions} options - 包含下载设置的配置选项。
   */
  constructor(options: DownloadConfigOptions = {}) {
    this.timeout = options.timeout ?? DEFAULT_DOWNLOAD_CONFIG.timeout
    this.retry_times = options.retry_times ?? DEFAULT_DOWNLOAD_CONFIG.retry_times
    this.fail_delay = options.fail_delay ?? DEFAULT_DOWNLOAD_CONFIG.fail_delay
    this.store_path = options.store_path ?? DEFAULT_DOWNLOAD_CONFIG.store_path
    this.with_tag = options.with_tag ?? DEFAULT_DOWNLOAD_CONFIG.with_tag
    this.with_dictionary = options.with_dictionary ?? DEFAULT_DOWNLOAD_CONFIG.with_dictionary
    this.url_only = options.url_only ?? DEFAULT_DOWNLOAD_CONFIG.url_only
    this.num_concurrent = options.num_concurrent ?? DEFAULT_DOWNLOAD_CONFIG.num_concurrent
    this.start_delay = options.start_delay ?? DEFAULT_DOWNLOAD_CONFIG.start_delay
    this.max_timeout = options.max_timeout ?? DEFAULT_DOWNLOAD_CONFIG.max_timeout
  }
}
