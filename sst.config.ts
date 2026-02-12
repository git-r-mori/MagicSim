/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "magicsim",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const site = new sst.aws.StaticSite("MagicSimFrontend", {
      path: "pkg/frontend",
      build: {
        command: "npm run build",
        output: "dist",
      },
      dev: {
        command: "npm run dev",
        url: "http://localhost:5173",
      },
    });

    return {
      url: site.url,
    };
  },
});
