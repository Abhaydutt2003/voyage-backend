module.exports = {
  apps: [
    {
      name: "voyage-backend",
      script: "npm",
      args: "run start",
      instances: 1,
      max_memory_restart: "400M",
      node_args: "--max-old-space-size=350",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
    },
  ],
};
