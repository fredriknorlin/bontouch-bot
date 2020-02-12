/*
Bonjour ID: "_apparata-approach-v0001._tcp"

Handshake
---------
S: APPSERVICEV0001
C: APPCLIENTV0001

Message
-------
Int16(metadata size)
Data(metadata (always JSON))
Int32(data size)
Data(data)
*/

var net = require('net');
var strategy = require('./strategy');

connect(strategy.host, strategy.port);

function connect(host, port) {
    var client = new net.Socket();
    client.connect(port, host, function() {
        console.log("Connected!");
    })    

    client.on('data', function(data) {
        handleDataFromSocket(client, data);
    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

var metadataSize, metadata, messageSize, message;
var hasSentHandshake = false;

function handleDataFromSocket(client, data) {
        if (!hasSentHandshake) {
            client.write('APPCLIENTV0001');
            hasSentHandshake = true;
            return;
        }
        if (metadataSize == null) {
            metadataSize = data.readInt16LE();
        }
        var currentMetadataLength = 0;
        if (metadata != null) {
            currentMetadataLength = metadata.length
        }

        if (currentMetadataLength < metadataSize) {
            if (metadata == null) {
                metadata = Buffer.alloc(0)
                data = data.slice(2, data.length + 1)
            }

            metadata = Buffer.concat([metadata, data.slice(0, metadataSize - currentMetadataLength)]);
            data = data.slice(metadataSize - currentMetadataLength, data.length + 1)
        }

        if (metadata.length != metadataSize || data.length == 0) {
            return;
        }

        if (messageSize == null) {
            messageSize = data.readInt32LE();
        }
        var currentMessageLength = 0;
        if (message != null) {
            currentMessageLength = message.length
        }

        if (currentMessageLength < messageSize) {
            if (message == null) {
                message = Buffer.alloc(0)
                data = data.slice(4, data.length + 1)
            }

            message = Buffer.concat([message, data.slice(0, messageSize - currentMessageLength)]);
            data = data.slice(messageSize - currentMessageLength, data.length + 1)
        }

        if (message.length != messageSize) {
            return;
        }


        if (!handleData(client, data, JSON.parse(metadata), JSON.parse(message))) {
            client.destroy();
        }
        metadataSize = null;
        metadata = null;
        messageSize = null;
        message = null;
        if (data.length > 0) {
            handleDataFromSocket(client, data);
        }
}

function handleData(client, data, metadata, message) {
    var rMetadata = null;
    var rMessage = null;

    switch(metadata.messageType) {
        case 'thunderdomeInfo':
            rMetadata = `{ "messageType": "hello" }`;
            rMessage = JSON.stringify({
                'player': {
                    'name': strategy.name
                }
            });
            break;
        case 'youAre':
            strategy.youAre(message.player);
            break;
        case 'playTurn':
            var game = message.game;
            console.log("\ngame", game)
            console.log("\ngame", game.playerEntries, "\n\n\n")
            rMetadata = `{ "messageType": "move" }`;
            rMessage = JSON.stringify({
                'game': game,
                'move': strategy.playTurn(game.playerEntries, game)
            });
            break;
        case 'turnDidEnd':
            strategy.turnDidEnd(message.result, message.game.playerEntries, message.game);
            break;
        default:
            return true;
    }

    if (rMetadata != null && rMessage != null) {
        var messageLength = Buffer.byteLength(rMessage, 'utf8');
        var metadataLength = Buffer.byteLength(rMetadata, 'utf8');
        var responseSize = 2 + metadataLength + 4 + messageLength;
        var buffer = Buffer.alloc(responseSize);
        buffer.writeInt16LE(metadataLength);
        buffer.write(rMetadata, 2);
        buffer.writeInt32LE(messageLength, 2 + metadataLength);
        buffer.write(rMessage, 2 + metadataLength + 4);
        client.write(buffer);
    }
    return true;
}
