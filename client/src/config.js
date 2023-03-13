const config = {

  model: "deploy", // "deploy" or 'dev'
  dev: {
    domain: "http://localhost:5000",
    frontEnd: "http://localhost:3000",
  },
  deploy: {
    domain: "https://lazydev.onrender.com",
    frontEnd: "https://lazydev.onrender.com",
  },
};
// "proxy": "http://localhost:5000",
module.exports = config;
