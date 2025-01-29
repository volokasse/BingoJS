// LIBRARIES
import WebSocket, { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// CLASSES
import { Game } from './classes/Game';

// ENUMS
import { MessageType } from './enums/MessageType';

// INTERFACES
interface CustomWebSocket extends WebSocket {
    id: string;
}

dotenv.config();

(async() => {
    const _db = await mysql.createConnection({
        host     : process.env.DB_HOST          || '127.0.0.1',
        port     : parseInt(process.env.DB_PORT || '3306'),
        user     : process.env.DB_USER          || 'root',
        password : process.env.DB_PASSWORD      || 'root',
        database : process.env.DB_NAME          || 'bingo'
    });

    let _wsPort = parseInt(process.env.WS_PORT || '8081');
    const _WSS = new WebSocketServer({port: _wsPort});
    var _Game: Game = new Game();
    _Game.init(_db);

    var lastWinner: number[] = [];

    function broadcast(WS: WebSocketServer, Msg: string, exceptIDs?: string[])
    {
        WS.clients.forEach(function each(client: WebSocket)
        {
            const _client = client as CustomWebSocket;
            if (_client.readyState === WebSocket.OPEN)
            {
                if (exceptIDs !== undefined && exceptIDs.length > 0 && _client.id !== undefined && exceptIDs.includes(_client.id))
                    return;

                _client.send(Msg);
            }
        });
    }

    _WSS.on('connection', async function connection(_WS: CustomWebSocket)
    {
        console.log("Client connected");

        // Assign random id
        _WS.id = Math.random().toString(36).substring(2, 15);

        let ranking = await _Game.getRanking(_db);
        let msg = {type: MessageType.INIT, datas: {
            players: _Game.getPlayersListSerialized(),
            running: _Game.isRunning(),
            ranking: ranking
        }};
        _WS.send(JSON.stringify(msg));

        _WS.on('error', console.error);
        _WS.on('message', async function message(data)
        {
            let msg = JSON.parse(data.toString());
            if (msg.type === undefined)
            {
                console.log('Message without type');
                console.log(data.toString());
                return;
            }

            let type  = msg.type;
            let datas = msg.datas;
            console.log("msg type : " + type);
            console.log("datas : ");
            console.log(datas);

            // Reusable variables
            let playerID: number = 0;
            let cellID: number   = 0;

            switch(type)
            {
                case MessageType.GENERATE_BINGO:
                    playerID = datas.player;

                    _Game.setGridSize(datas.type);
                    _Game.addPlayer(datas.player);

                    msg = {
                        type: MessageType.GENERATE_BINGO_RESULT,
                        datas: {
                            grids: _Game.getGrids(),
                            type: datas.type,
                            player: _Game.getPlayer(playerID)?.toObject(),
                            creator: _Game.getCreator(),
                            running: _Game.isRunning()
                        }
                    };
                    _WS.send(JSON.stringify(msg));

                    msg = {
                        type: MessageType.UPDATE_GRIDS_RESULT,
                        datas: {
                            grids: _Game.getGrids(),
                            creator: _Game.getCreator(),
                            running: _Game.isRunning()
                        }
                    };
                    broadcast(_WSS, JSON.stringify(msg), [_WS.id]);

                    break;
                case MessageType.PICK_CELL:
                    cellID   = datas.cell_id;
                    playerID = datas.player_id;

                    if (!_Game.isRunning())
                    {
                        console.log("Game not started");
                        return;
                    }

                    _Game.pickCell(cellID);
                    
                    msg = {
                        type: MessageType.PICK_CELL_RESULT,
                        datas: {
                            grids: _Game.getGrids()
                        }
                    };

                    broadcast(_WSS, JSON.stringify(msg));
                    break;
                case MessageType.JOIN_BINGO:
                    playerID = datas.player;
                    if (!_Game.isRunning())
                    {
                        console.log("Game not started");
                        return;
                    }

                    if (!_Game.addPlayer(playerID))
                        _Game.refreshGrids();

                    msg = {
                        type: MessageType.JOIN_BINGO_RESULT, 
                        datas: {
                            grids: _Game.getGrids(),
                            player: _Game.getPlayer(playerID)?.toObject(),
                            type: _Game.getBingoType(),
                            creator: _Game.getCreator()
                        }
                    };

                    _WS.send(JSON.stringify(msg));

                    msg = {
                        type: MessageType.UPDATE_GRIDS_RESULT,
                        datas: {
                            grids: _Game.getGrids()
                        }
                    };
                    broadcast(_WSS, JSON.stringify(msg), [_WS.id]);
                    break;
                case MessageType.UNDO_PICK:
                    _Game.undoPick();
                    msg = {
                        type: MessageType.UNDO_PICK_RESULT,
                        datas: {
                            grids: _Game.getGrids()
                        }
                    };

                    broadcast(_WSS, JSON.stringify(msg));
                    break;
                case MessageType.END_GAME:
                    await _Game.end(_db);
                    _Game.reset();
                    lastWinner = [];

                    let ranking = await _Game.getRanking(_db);
                    msg = {
                        type: MessageType.END_GAME_RESULT,
                        datas: {
                            ranking: ranking
                        }
                    };

                    broadcast(_WSS, JSON.stringify(msg));
                    break;
                case MessageType.NONE:
                default:
                    break;
            }

            // After processing operations
            let winners = _Game.getWinners();
            if (winners !== lastWinner)
            {
                lastWinner = winners;
                broadcast(_WSS, JSON.stringify({type: MessageType.CHECK_GAME_RESULT, datas: {grids: _Game.getGrids(), winners: winners}}));
            }
        });
    });
})();