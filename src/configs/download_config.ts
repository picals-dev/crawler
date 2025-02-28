/**
 * Configuration options for downloading images.
 * @interface
 */
interface DownloadConfigOptions {
  /** Timeout for requests */
  readonly timeout: number
  /** Maximum number of retries */
  readonly retry_times: number
  /** Delay between retries */
  readonly fail_delay: number
  readonly store_path: string
  readonly with_tag: boolean
  readonly url_only: boolean
  readonly num_threads: number
  readonly thread_delay: number
}
