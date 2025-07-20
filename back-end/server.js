const WebSocket = require("ws");
require("dotenv").config();

const HOST_WEBSOCKET = process.env.HOST || '0.0.0.0';
const PORT_WEBSOCKET = process.env.PORT || 8080;

const wss = new WebSocket.Server({ host: HOST_WEBSOCKET, port: PORT_WEBSOCKET });

console.log("Server webesocket is run...");

const clients_connected = new Set();

wss.on("connection", (ws) => {
    console.log("Client connected!");

    ws.on("message", (event) => {
        const data = JSON.parse(event);

        if (data.type == 'login') {
            clients_connected.add({ name: data.name, ws: ws });
            updateClients();
        }

        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });

    });

    ws.on('close', () => {
        clients_connected.forEach((client) => {
            if (client.ws === ws) clients_connected.delete(client);
            updateClients();
        });
    });

});

const updateClients = () => {

    let clients_name = [];

    clients_connected.forEach((client) => {
        clients_name.push(client.name);
    });

    const data = JSON.stringify({ type: 'counter', clients_name: clients_name, client_counter: clients_connected.size - 1 });

    clients_connected.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(data);
        }
    });

}
