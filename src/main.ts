import * as http from "http";
import { demo } from "./demo/demo";

function main() {
  console.log("test node ts12");
  demo();
}

main();
// ====================
const server = http.createServer(function(
  request: http.IncomingMessage,
  response: http.ServerResponse
): void {
  console.log("create a server...");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("Hello world,we use typescript to develop.");
  response.end();
});

server.listen(3000, function() {
  console.log("Server listening on port 3000");
  console.log("test...");
});
