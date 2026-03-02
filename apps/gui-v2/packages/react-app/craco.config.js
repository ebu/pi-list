/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      // Preserve existing resolve and add polyfill fallbacks
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        url: require.resolve('url/'),
        fs: false,
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser.js'),
      };

      // Alias to ensure ESM imports for process/browser resolve correctly
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['process/browser'] = require.resolve('process/browser.js');

      // Inject global providers
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Ensure .cjs files are parsed as JavaScript (prevents axios CJS from being treated as an asset)
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.cjs$/,
        type: 'javascript/auto',
      });

      return config;
    },
  },
  devServer: (devServerConfig) => {
        // Translate deprecated https boolean to server option for WDS v5
        if (typeof devServerConfig.https !== 'undefined') {
          if (devServerConfig.https === true) {
            devServerConfig.server = 'https';
          } else {
            devServerConfig.server = 'http';
          }
          delete devServerConfig.https;
        }
    // Normalize deprecated hooks to setupMiddlewares for WDS >=4/5
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    // Translate onBeforeSetupMiddleware to setupMiddlewares
    if (typeof devServerConfig.onBeforeSetupMiddleware === 'function') {
      const before = devServerConfig.onBeforeSetupMiddleware;
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        before(devServer);
        if (typeof originalSetupMiddlewares === 'function') {
          middlewares = originalSetupMiddlewares(middlewares, devServer) || middlewares;
        }
        return middlewares;
      };
      delete devServerConfig.onBeforeSetupMiddleware;
    }

    // Translate onAfterSetupMiddleware to setupMiddlewares
    if (typeof devServerConfig.onAfterSetupMiddleware === 'function') {
      const after = devServerConfig.onAfterSetupMiddleware;
      const prev = devServerConfig.setupMiddlewares;
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (typeof prev === 'function') {
          middlewares = prev(middlewares, devServer) || middlewares;
        }
        after(devServer);
        return middlewares;
      };
      delete devServerConfig.onAfterSetupMiddleware;
    }

    // Ensure setupMiddlewares exists even if none of the above matched
    if (typeof devServerConfig.setupMiddlewares !== 'function') {
      devServerConfig.setupMiddlewares = (middlewares) => middlewares;
    }

    // Add CRA compatibility shim: react-scripts expects devServer.close()
    const prevSetup = devServerConfig.setupMiddlewares;
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (devServer && typeof devServer.stop === 'function' && typeof devServer.close !== 'function') {
        devServer.close = devServer.stop.bind(devServer);
      }
      return typeof prevSetup === 'function' ? (prevSetup(middlewares, devServer) || middlewares) : middlewares;
    };
    return devServerConfig;
  },
};
