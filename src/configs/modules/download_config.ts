/**
 * Configuration options for downloading images.
 * @interface
 */
interface DownloadConfigOptions {
  /** Timeout for requests */
  readonly timeout?: number
  /** Maximum number of retries */
  readonly retry_times?: number
  /** Delay between retries */
  readonly fail_delay?: number
  /** Image save path */
  readonly store_path?: string
  /** Whether to download tags to a separate JSON file */
  readonly with_tag?: boolean
  /** Only download works' urls */
  readonly url_only?: boolean
  /** How many parallel threads for downloading */
  readonly num_threads?: number
  /** Waiting time (s) after thread start */
  readonly thread_delay?: number
}

/**
 * Represents configuration options for downloading images.
 * Encapsulates settings for timeouts, retries, storage, and parallel downloads.
 *
 * @class
 * @implements {DownloadConfigOptions}
 */
export class DownloadConfig implements DownloadConfigOptions {
  public readonly timeout: number
  public readonly retry_times: number
  public readonly fail_delay: number
  public readonly store_path: string
  public readonly with_tag: boolean
  public readonly url_only: boolean
  public readonly num_threads: number
  public readonly thread_delay: number

  constructor(options: DownloadConfigOptions = {}) {
    this.timeout = options.timeout ?? 4
    this.retry_times = options.retry_times ?? 10
    this.fail_delay = options.fail_delay ?? 1
    this.store_path = options.store_path ?? './images'
    this.with_tag = options.with_tag ?? true
    this.url_only = options.url_only ?? false
    this.num_threads = options.num_threads ?? 12
    this.thread_delay = options.thread_delay ?? 1
  }
}
