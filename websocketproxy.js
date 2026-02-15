const net = require("net");
const WebSocket = require("ws");

const CS_PORT = 5000;            // ChatScript server port
const CS_HOST = "18.222.131.3";     // ChatScript IP
const WS_PORT = 8080;            // WebSocket proxy port

const wss = new WebSocket.Server({ port: WS_PORT });

console.log("WebSocket proxy running on ws://127.0.0.1:" + WS_PORT);

wss.on("connection", (ws) => {
  console.log("Browser connected.");

  ws.on("message", (msg) => {
    console.log("Browser says:", msg.toString());

    // Create a *new* TCP connection for each request
    const cs = net.connect(CS_PORT, CS_HOST, () => {
      console.log("Connected to ChatScript");

      // Format: username\0botname\0message\0
      const payload =
        "Ben\0" +      // username
        "Dolan\0" +    // your bot name (or "" for default)
        msg.toString() + "\0";

      cs.write(payload);
    });

    // Receive from ChatScript
    cs.on("data", (data) => {
      console.log("Reply from ChatScript:", data.toString());
      ws.send(data.toString());   // send back to browser
      cs.end();                   // close TCP socket (important)
    });

    cs.on("error", (err) => {
      console.log("ChatScript TCP error:", err);
      ws.send("ERROR talking to ChatScript");
    });
  });

  ws.on("close", () => {
    console.log("Browser closed connection.");
  });
});