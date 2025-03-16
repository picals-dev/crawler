/**
 * 配置调试设置的选项。
 * @interface
 */
interface DebugConfigOptions {
  /** 是否启用详细日志。 */
  verbose?: boolean
  /** 是否显示错误消息。 */
  show_error?: boolean
}

/**
 * 表示用于调试目的的配置。
 * 此类封装了详细日志和错误消息的设置。
 *
 * @class
 * @implements {DebugConfigOptions}
 */
export class DebugConfig implements DebugConfigOptions {
  /** @inheritdoc */
  public verbose: boolean
  /** @inheritdoc */
  public show_error: boolean

  /**
   * 创建一个 DebugConfig 实例，并使用提供的选项配置。
   *
   * @param {DebugConfigOptions} options - 包含调试设置的配置选项。
   */
  constructor(options: DebugConfigOptions = {}) {
    this.verbose = options.verbose ?? false
    this.show_error = options.show_error ?? false
  }
}
