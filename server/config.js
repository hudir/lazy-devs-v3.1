const config = {

  model: "deploy", // "deploy"

  dev: {
    domain: "http://localhost:5000",
    frontEnd: "http://localhost:3000",
  },
  deploy: {
    domain: "https://lazydev.onrender.com",
    frontEnd: "https://lazydev.onrender.com",
  },
};

module.exports = config;
