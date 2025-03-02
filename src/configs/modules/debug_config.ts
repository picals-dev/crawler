/**
 * Options for configuring debug settings.
 * @interface
 */
interface DebugConfigOptions {
  /** Whether to enable verbose logging. */
  readonly verbose?: boolean
  /** Whether to show error messages. */
  readonly show_error?: boolean
}

/**
 * Represents a configuration for debugging purposes.
 * This class encapsulates settings for verbose logging and error messages.
 *
 * @class
 * @implements {DebugConfigOptions}
 */
export class DebugConfig implements DebugConfigOptions {
  /** @inheritdoc */
  readonly verbose: boolean
  /** @inheritdoc */
  readonly show_error: boolean

  /**
   * Creates an instance of DebugConfig with the provided options.
   *
   * @param {DebugConfigOptions} options - The configuration options containing debug settings.
   */
  constructor(options: DebugConfigOptions = {}) {
    this.verbose = options.verbose ?? false
    this.show_error = options.show_error ?? false
  }
}
