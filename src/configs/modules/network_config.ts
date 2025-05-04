import type { Agents } from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'

/**
 * 配置网络设置的选项。
 * @interface
 */
interface NetworkConfigOptions {
  /**
   * 网络请求的代理设置，按协议（例如，'http'，'https'）键入。
   * @example { http: 'http://proxy.example.com:8080' }
   */
  proxy?: ProxyConfig
  /**
   * 包含在网络请求中的HTTP头。
   * @example { 'Content-Type': 'application/json' }
   */
  headers?: HeaderConfig
}

type ProxyProtocol = 'http' | 'https'
type ProxyConfig = Partial<Record<ProxyProtocol, string>>
type HeaderConfig = Record<string, string>

const DEFAULT_NETWORK_CONFIG = {
  proxy: {},
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  },
}

/**
 * 表示用于进行HTTP请求的网络配置。
 * 封装了代理和头设置，并具有合理的默认值。
 *
 * @class
 * @implements {NetworkConfigOptions}
 */
export class NetworkConfig implements NetworkConfigOptions {
  /** @inheritdoc */
  public proxy: ProxyConfig
  /** @inheritdoc */
  public headers: HeaderConfig
  public agent: Agents | undefined

  /**
   * 使用提供的选项创建 NetworkConfig 实例。
   * 如果未提供选项，则使用默认代理（空）和默认User-Agent头。
   *
   * @param {NetworkConfigOptions} [options] - 网络配置选项。
   * @example
   * const config = new NetworkConfig({ proxy: { http: 'http://proxy.com:8080' } });
   */
  constructor(options: NetworkConfigOptions = DEFAULT_NETWORK_CONFIG) {
    this.proxy = options.proxy ?? {}
    this.agent = this.proxy.http
      ? { http: new HttpProxyAgent({ proxy: this.proxy.http }) }
      : this.proxy.https
        ? { https: new HttpsProxyAgent({ proxy: this.proxy.https }) }
        : undefined
    this.headers = options.headers ?? DEFAULT_NETWORK_CONFIG.headers
  }
}
