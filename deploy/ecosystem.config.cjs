module.exports = {
  apps: [
    {
      name: "miniapp-backend",
      cwd: "./backend",
      script: "dist/index.js",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
      },
    },
  ],
};
