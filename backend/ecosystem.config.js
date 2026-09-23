module.exports = {
  apps: [
    {
      name: 'dtech-backend',
      script: './server.js',
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
      autorestart: true,
      watch: false,
    },
  ],
};
