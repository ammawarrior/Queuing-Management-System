const WebSocket = require('ws');
const http = require('http');

const port = 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let displaySocket = null;

wss.on('connection', (ws) => {
    console.log('A client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);

        try {
            const data = JSON.parse(message);

            if (data.type === 'register' && data.client === 'display') {
                displaySocket = ws;
                console.log('Display client registered');
            } else if (data.type === 'notify') {
                if (displaySocket && displaySocket.readyState === WebSocket.OPEN) {
                    displaySocket.send(JSON.stringify({
                        type: 'notify',
                        fullName: data.fullName,
                        tellerName: data.tellerName
                    }));
                    console.log('Notify message sent to display');
                } else {
                    console.log('Display client not connected');
                }
            }
        } catch (error) {
            console.error('Invalid message:', message);
        }
    });

    ws.on('close', () => {
        if (ws === displaySocket) {
            console.log('Display client disconnected');
            displaySocket = null;
        } else {
            console.log('A client disconnected');
        }
    });
});

server.listen(port, () => {
    console.log(`WebSocket server is listening on port ${port}`);
});
