import { serve } from "bun";

const server = serve({
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/ws/notifications") {
      const upgrade = server.upgrade(req); // <-- pass req here
      const ws = upgrade.socket;

      ws.addEventListener("message", (event) => {
        console.log("Received:", event.data);
        // handle message
      });

      ws.send("Welcome to notifications WebSocket");

      return upgrade.response;
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server started on http://localhost:3001");
