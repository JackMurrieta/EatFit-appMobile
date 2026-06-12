// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:babel-plugin-dotenv-import", {
        moduleName: "@env",
        path: ".env",
        safe: false,
        allowUndefined: true,
      }],
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@features": "./features",
          "@shared": "./shared",
          "@infrastructure": "./infrastructure",
        },
      }],
    ],
  };
};