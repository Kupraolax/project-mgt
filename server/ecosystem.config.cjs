module.exports = {
  apps: [
    {
      name: "project-mgt",
      script: "npm",
      args: "run start",
      cwd: "/root/project-mgt/server",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

