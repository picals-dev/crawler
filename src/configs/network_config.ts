/**
 * Configuration options for network settings.
 * @interface
 */
interface NetworkConfigOptions {
  /**
   * Proxy settings for network requests, keyed by protocol (e.g., 'http', 'https').
   * @example { http: 'http://proxy.example.com:8080' }
   */
  readonly proxy?: ProxyConfig

  /**
   * HTTP headers to include in network requests.
   * @example { 'Content-Type': 'application/json' }
   */
  readonly headers?: HeaderConfig
}

type ProxyProtocol = 'http' | 'https' | 'socks5'
type ProxyConfig = Partial<Record<ProxyProtocol, string>>
type HeaderConfig = Record<string, string>

const DEFAULT_NETWORK_CONFIG = {
  proxy: {},
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  },
}

/**
 * Represents network configuration for making HTTP requests.
 * Encapsulates proxy and header settings with sensible defaults.
 *
 * @class
 * @implements {NetworkConfigOptions}
 */
export class NetworkConfig implements NetworkConfigOptions {
  /** @inheritdoc */
  readonly proxy: ProxyConfig

  /** @inheritdoc */
  readonly headers: HeaderConfig

  /**
   * Creates an instance of NetworkConfig with the provided options.
   * If no options are provided, uses default proxy (empty) and a default User-Agent header.
   *
   * @param {NetworkConfigOptions} [options] - The network configuration options.
   * @example
   * const config = new NetworkConfig({ proxy: { http: 'http://proxy.com:8080' } });
   */
  constructor(options: NetworkConfigOptions = DEFAULT_NETWORK_CONFIG) {
    this.proxy = options.proxy ?? {}
    this.headers = options.headers ?? DEFAULT_NETWORK_CONFIG.headers
  }
}
