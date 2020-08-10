module.exports = {
  apps : [
      {
        name: "school",
        script: "./app.js",
        watch: false,
        env: {
            "PORT": 3001,
            "NODE_ENV": "production",
        }
      }
  ]
}
