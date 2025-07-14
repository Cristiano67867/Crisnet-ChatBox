const WebSocket = require("ws");
require("dotenv").config();

const HOST_WEBSOCKET = process.env.HOST || '0.0.0.0';
const PORT_WEBSOCKET = process.env.PORT || 8080;

const wss = new WebSocket.Server({ host: HOST_WEBSOCKET, port: PORT_WEBSOCKET });

console.log("Server webesocket is run...");

const clients_connected = new Set();

wss.on("connection", (ws) => {
    console.log("Client connected!");
    clients_connected.add(ws);
    updateClients();

    ws.on("message", (event) => {
        const data = JSON.parse(event);
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        clients_connected.delete(ws);
        updateClients();
    });

});

const updateClients = () => {
    const data = JSON.stringify({ type: 'counter', clients: clients_connected.size - 1 });
    for (_client of clients_connected) {
        if (_client.readyState === WebSocket.OPEN) {
            _client.send(data);
        }
    }
}
