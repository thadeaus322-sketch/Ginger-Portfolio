// PM2 process manager config
// Usage: pm2 start ecosystem.config.cjs
//        pm2 save
//        pm2 startup   (to auto-start on reboot)

module.exports = {
  apps: [
    {
      name: "ginger-studios",
      script: "./dist/index.mjs",
      cwd: "/var/www/ginger-studios",   // ← change to wherever you copied the app
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      env_file: ".env",                  // reads your .env file automatically
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
