const path = require("path");

/** Абсолютный cwd: иначе при другом месте вызова `pm2 start` относительный `./backend` может быть неверным. */
const backendDir = path.join(__dirname, "..", "backend");

module.exports = {
  apps: [
    {
      name: "miniapp-backend",
      cwd: backendDir,
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
