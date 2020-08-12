// eslint-disable-next-line @typescript-eslint/no-var-requires
const HandlerRunner = require('serverless-offline/dist/lambda/handler-runner/index').default;

/**
 * See: https://gist.github.com/cchamplin/c55778d4a70854a5d72bab2a8c4450fe
 */
class OfflineInvalidate {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.hooks = {
      'before:offline:start:init': (opts) => this.inject(),
    };
    this.lastRunner = {};
  }

  // eslint-disable-next-line class-methods-use-this
  cacheInvalidation(filePath) {
    if (require.cache[require.resolve(filePath)]) {
      delete require.cache[require.resolve(filePath)];
    }
  }

  findPrivateProperty(obj, propName) {
    const props = Object.getOwnPropertyNames(obj);
    // eslint-disable-next-line no-restricted-syntax
    for (const prop of props) {
      if (prop.indexOf(`_${propName}`) > 0) {
        return prop;
      }
    }
    return null;
  }

  inject() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const oldRun = HandlerRunner.prototype.run;
    const run = async function (event, context) {
      const runnerPropName = that.findPrivateProperty(this, 'runner');
      const funOptionsPropName = that.findPrivateProperty(this, 'funOptions');
      if (!runnerPropName || !funOptionsPropName) {
        return oldRun(event, context);
      }

      const runner = this[runnerPropName];
      const funOptions = this[funOptionsPropName];
      const internalRef = funOptions.handlerPath || funOptions.handler;

      if (that.lastRunner[internalRef]) {
        await that.lastRunner[internalRef].cleanup();
      }

      that.cacheInvalidation(internalRef);

      const runnerInstance = (this[runnerPropName] = await this._loadRunner());

      that.lastRunner[internalRef] = runnerInstance;

      return runnerInstance.run(event, context);
    };
    HandlerRunner.prototype.run = run;
  }
}

module.exports = OfflineInvalidate;
