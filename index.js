const server = require("./app");

function startServer() {  
  const PORT = process.env.PORT || 8080;
  
  server.listen(PORT, () => {
    console.info(`Server running 🤖🚀 at http://localhost:${PORT}/`);
  });
}

setImmediate(startServer);
