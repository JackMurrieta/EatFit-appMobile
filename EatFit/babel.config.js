module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Variables de entorno (.env)
      [
        "dotenv-import",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: false,
        },
      ],
      // Path aliases (@lib, @components, etc.)
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@infrastructure": "./infrastructure",
            "@features": "./features",
            "@app": "./app",
            "@assets": "./assets",
            "@shared": "./shared",
          },
        },
      ],
    ],
  };
};
