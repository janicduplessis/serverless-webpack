'use strict';

const _ = require('lodash');
const BbPromise = require('bluebird');
const { Worker } = require('jest-worker');

function ensureArray(obj) {
  return _.isArray(obj) ? obj : [obj];
}

function webpackConcurrentCompile(configs, concurrency) {
  const worker = new Worker(require.resolve('./compileWorker'), {
    numWorkers: concurrency,
    enableWorkerThreads: true,
    maxRetries: 0
  });
  return BbPromise.map(configs, config => worker.compile(config)).then(stats => _.flatten(stats));
}

module.exports = {
  compile() {
    this.serverless.cli.log('Bundling with Webpack...');

    const configs = ensureArray(this.webpackConfig);

    if (!this.configuration) {
      return BbPromise.reject('Missing plugin configuration');
    }
    const concurrency = this.configuration.concurrency;

    return webpackConcurrentCompile(configs, concurrency).then(stats => {
      this.compileStats = { stats };
      return BbPromise.resolve();
    });
  }
};
