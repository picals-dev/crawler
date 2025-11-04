/**
 * 用户配置选项。
 * @interface
 */
interface UserConfigOptions {
  /** 用户 ID，在个人资料 URL 中找到（例如，https://www.pixiv.net/users/xxxx）。 */
  userId?: string

  /** 认证 cookie，可通过浏览器开发者工具获取，或为空。 */
  cookie?: string
}

/**
 * 表示用于访问 Pixiv API 的用户配置。
 * 此类封装了用户 ID 和 cookie 所需的认证。
 *
 * @class
 * @implements {UserConfigOptions}
 */
export class UserConfig implements UserConfigOptions {
  /** @inheritdoc */
  public userId: string

  /** @inheritdoc */
  public cookie: string

  /**
   * 使用提供的选项创建 UserConfig 实例。
   *
   * @param {UserConfigOptions} options - 包含用户 ID 和 cookie 的配置选项。
   */
  constructor(options: UserConfigOptions = {}) {
    this.userId = options.userId ?? ''
    this.cookie = options.cookie ?? ''
  }
}
