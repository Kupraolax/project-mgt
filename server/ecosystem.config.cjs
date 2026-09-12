module.exports = {
  apps: [
    {
      name: "project-mgt",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
