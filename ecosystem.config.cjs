module.exports = {
  apps: [{
    name: 'cryptoswap',
    script: './server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: 'localhost'
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_restarts: 10,
    restart_delay: 4000,
    wait_ready: true,
    kill_timeout: 3000
  }]
};