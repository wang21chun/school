module.exports = {
  apps : [
      {
        name: "ComputerRoom",
        script: "./app.js",
        watch: false,
        env_production: {
            "PORT": 3000,
            "NODE_ENV": "production",
        }
      }
  ]
}
