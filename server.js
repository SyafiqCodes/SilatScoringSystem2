const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let redQueue = {};
let blueQueue = {};
let redScore = 0;
let blueScore = 0;

let redScoreHistory = [];
let blueScoreHistory = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    const clientId = uuidv4();
    socket.clientId = clientId;
    console.log(`New client connected: ${clientId}`);

    socket.on('score', (data) => {
        if (data.corner === 'red') {
            if (!redQueue[data.value]) {
                redQueue[data.value] = { clients: new Set([clientId]), timer: setTimeout(() => {
                    delete redQueue[data.value];
                }, 1000) }; // Set timeout to 1 seconds
            } else {
                redQueue[data.value].clients.add(clientId);
                if (redQueue[data.value].clients.size >= 2) {
                    redScore += parseInt(data.value);
                    io.emit('updateScore', { corner: 'red', value: redScore });
                    clearTimeout(redQueue[data.value].timer);
                    delete redQueue[data.value];
                }
            }
        } else if (data.corner === 'blue') {
            if (!blueQueue[data.value]) {
                blueQueue[data.value] = { clients: new Set([clientId]), timer: setTimeout(() => {
                    delete blueQueue[data.value];
                }, 1000) }; // Set timeout to 1 seconds
            } else {
                blueQueue[data.value].clients.add(clientId);
                if (blueQueue[data.value].clients.size >= 2) {
                    blueScore += parseInt(data.value);
                    io.emit('updateScore', { corner: 'blue', value: blueScore });
                    clearTimeout(blueQueue[data.value].timer);
                    delete blueQueue[data.value];
                }
            }
        }
    });

    socket.on('adminScore', (data) => {
        if (data.corner === 'red') {
            redScore += parseInt(data.value);
            redScoreHistory.push(parseInt(data.value));
            io.emit('updateScore', { corner: 'red', value: redScore });
        } else if (data.corner === 'blue') {
            blueScore += parseInt(data.value);
            blueScoreHistory.push(parseInt(data.value));
            io.emit('updateScore', { corner: 'blue', value: blueScore });
        }
    });

    socket.on('adminBackspace', (data) => {
        if (data.corner === 'red' && redScoreHistory.length > 0) {
            redScore -= redScoreHistory.pop();
            io.emit('updateScore', { corner: 'red', value: redScore });
        } else if (data.corner === 'blue' && blueScoreHistory.length > 0) {
            blueScore -= blueScoreHistory.pop();
            io.emit('updateScore', { corner: 'blue', value: blueScore });
        }
    });

    socket.on('reset', () => {
        redQueue = {};
        blueQueue = {};
        redScore = 0;
        blueScore = 0;
        redScoreHistory = [];
        blueScoreHistory = [];
        io.emit('reset');
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${clientId}`);
    });
});

const port = 3000;
server.listen(port, () => console.log(`Listening on port ${port}`));
