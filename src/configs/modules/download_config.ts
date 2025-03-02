/**
 * Configuration options for downloading images.
 * @interface
 */
interface DownloadConfigOptions {
  /** Timeout for requests */
  timeout?: number
  /** Maximum number of retries */
  retry_times?: number
  /** Delay between retries */
  fail_delay?: number
  /** Image save path */
  store_path?: string
  /** Whether to download tags to a separate JSON file */
  with_tag?: boolean
  /** Only download works' urls */
  url_only?: boolean
  /** How many parallel threads for downloading */
  num_threads?: number
  /** Waiting time (s) after thread start */
  thread_delay?: number
  /** Maximum timeout for a single request */
  max_timeout?: number
}

const DEFAULT_DOWNLOAD_CONFIG: Required<DownloadConfigOptions> = {
  timeout: 4,
  retry_times: 10,
  fail_delay: 1,
  store_path: './images',
  with_tag: true,
  url_only: false,
  num_threads: 12,
  thread_delay: 1,
  max_timeout: 60,
}

/**
 * Represents configuration options for downloading images.
 * Encapsulates settings for timeouts, retries, storage, and parallel downloads.
 *
 * @class
 * @implements {DownloadConfigOptions}
 */
export class DownloadConfig implements DownloadConfigOptions {
  public timeout: number
  public retry_times: number
  public fail_delay: number
  public store_path: string
  public with_tag: boolean
  public url_only: boolean
  public num_threads: number
  public thread_delay: number
  public max_timeout: number

  constructor(options: DownloadConfigOptions = {}) {
    this.timeout = options.timeout ?? DEFAULT_DOWNLOAD_CONFIG.timeout
    this.retry_times = options.retry_times ?? DEFAULT_DOWNLOAD_CONFIG.retry_times
    this.fail_delay = options.fail_delay ?? DEFAULT_DOWNLOAD_CONFIG.fail_delay
    this.store_path = options.store_path ?? DEFAULT_DOWNLOAD_CONFIG.store_path
    this.with_tag = options.with_tag ?? DEFAULT_DOWNLOAD_CONFIG.with_tag
    this.url_only = options.url_only ?? DEFAULT_DOWNLOAD_CONFIG.url_only
    this.num_threads = options.num_threads ?? DEFAULT_DOWNLOAD_CONFIG.num_threads
    this.thread_delay = options.thread_delay ?? DEFAULT_DOWNLOAD_CONFIG.thread_delay
    this.max_timeout = options.max_timeout ?? DEFAULT_DOWNLOAD_CONFIG.max_timeout
  }
}
