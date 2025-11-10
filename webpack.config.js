const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: options.entry,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
      },
    },
    module: {
      ...options.module,
      rules: [
        ...(options.module?.rules || []),
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/,
            /frontend/,
            /dist/,
            /test/,
            /\.spec\.ts$/,
          ],
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
      ],
    },
  };
};

