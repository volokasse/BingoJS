// src/stores/useWebSocketStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { MessageType } from '@/enums/MessageType';
import { Player } from '@/classes/Player';
import type { BingoCell, Grid, Rank, Ranking } from '@/interfaces/Interfaces';

export const useWebSocketStore = defineStore('webSocket', () =>
{
    const socket: Ref<WebSocket|null>   = ref(null);    // Stock WS connection
    const isConnected                   = ref(false);   // Connection state
    const grid: Ref<BingoCell[]>        = ref([]);      // Main bingo datas
    const otherGrids: Ref<Grid[]>       = ref([]);      // Other players bingo datas
    const gridType: Ref<number>         = ref(0);
    const players: Ref<Player[]>        = ref([]);      // Players list
    const player: Ref<Player|null>      = ref(null);
    const isRunning: Ref<Boolean>       = ref(false);
    const hovering: Ref<number>         = ref(0);
    const winners: Ref<number[]>        = ref([]);
    const creator: Ref<number>          = ref(0);
    const ranking: Ref<Ranking|null>    = ref(null);

    // Init Websocket connection
    function connect()
    {
        if (socket.value)
            return;

        socket.value = new WebSocket(import.meta.env.VITE_WS_ENDPOINT);

        socket.value.onopen = () =>
        {
            console.log('WebSocket connecté');
            isConnected.value = true;
        };

        socket.value.onmessage = (event: MessageEvent) =>
        {
            let msg = JSON.parse(event.data);
            if (msg.type === undefined)
            {
                console.log('Message without type');
                console.log(event.data);
                return;
            }

            let type  = msg.type;
            let datas = msg.datas;

            console.log("Message Type : ", type);
            console.log("Message Datas : ", datas);

            // Update list of players
            if (datas.players !== undefined)
            {
                for(let player of datas.players)
                    players.value.push(new Player(player.id, player.name));
            }

            // Update actual player
            if (datas.player !== undefined)
            {
                player.value = new Player(datas.player.id, datas.player.name);
            }

            // Update grids
            if (datas.grids !== undefined)
            {
                const playerGridsUpdt = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id === player.value.id);
                grid.value            = playerGridsUpdt.length > 0 ? [...playerGridsUpdt[0].grid] as BingoCell[] : [];
                const otherGridsUpdt  = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id !== player.value.id);
                otherGrids.value      = otherGridsUpdt.length > 0 ? [...otherGridsUpdt] as Grid[] : [];
            }

            // Update grid type
            if (datas.type !== undefined)
            {
                gridType.value = datas.type;
            }

            // Update running state
            if (datas.running !== undefined)
            {
                isRunning.value = datas.running;
            }

            // Update winner
            if (datas.winners !== undefined)
            {
                winners.value = datas.winners;
            }

            // Update creator
            if (datas.creator !== undefined)
            {
                creator.value = datas.creator;
            }

            // Update ranking
            if (datas.ranking !== undefined)
            {
                ranking.value = datas.ranking as Ranking;
                console.log(ranking.value);
            }

            switch(type)
            {
                case MessageType.END_GAME_RESULT:
                    reset();
                    break;
                default:
                    break;
            }
            
            /*
            switch(type)
            {
                case MessageType.INIT:
                    for(let player of datas.players)
                        players.value.push(new Player(player.id, player.name));
                    isRunning.value = datas.running;
                    break;
                case MessageType.GENERATE_BINGO_RESULT:
                    player.value = new Player(datas.player.id, datas.player.name);
                    const playerGridsGen = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id === player.value.id);
                    grid.value = playerGridsGen.length > 0 ? [...playerGridsGen[0].grid] as BingoCell[] : [];
                    gridType.value = datas.type;
                    isRunning.value = true;
                    break;
                case MessageType.JOIN_BINGO_RESULT:
                    player.value = new Player(datas.player.id, datas.player.name);
                    const playerGridsJoin = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id === player.value.id);
                    grid.value = playerGridsJoin.length > 0 ? [...playerGridsJoin[0].grid] as BingoCell[] : [];
                    const otherGridsJoin = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id !== player.value.id);
                    otherGrids.value = otherGridsJoin.length > 0 ? [...otherGridsJoin] as Grid[] : [];
                    gridType.value = datas.type;
                    isRunning.value = true;
                    break;
                case MessageType.PICK_CELL_RESULT:
                case MessageType.UPDATE_GRIDS_RESULT:
                    const playerGridsUpdt = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id === player.value.id);
                    grid.value            = playerGridsUpdt.length > 0 ? [...playerGridsUpdt[0].grid] as BingoCell[] : [];
                    const otherGridsUpdt  = (datas.grids as Grid[]).filter(grid => player.value && grid.player.id !== player.value.id);
                    otherGrids.value      = otherGridsUpdt.length > 0 ? [...otherGridsUpdt] as Grid[] : [];
                    break;
                case MessageType.NONE:
                default:
                    break;
            }
            */
        };

        socket.value.onerror = (error: Event) =>
        {
            console.error('Erreur WebSocket :', error);
        };

        socket.value.onclose = () =>
        {
            console.log('WebSocket déconnecté');
            isConnected.value = false;
            socket.value = null;
        };
    }

    // Send message to server
    function sendMessage(type: number, message: object)
    {
        let fullMessage = {type: type, datas: message};

        if (isConnected.value && socket.value)
            socket.value.send(JSON.stringify(fullMessage));
        else
            console.warn('WebSocket non connecté');
    }

    // Close Websocket connection
    function disconnect()
    {
        if (socket.value)
        {
            socket.value.close();
            socket.value = null;
        }
    }

    // Reset all values
    function reset()
    {
        grid.value       = [];
        otherGrids.value = [];
        gridType.value   = 0;
        player.value     = null;
        isRunning.value  = false;
        hovering.value   = 0;
        winners.value    = [];
        creator.value    = 0;
    }

    return {
        connect,
        sendMessage,
        disconnect,
        isConnected,
        grid,
        gridType,
        players,
        player,
        isRunning,
        otherGrids,
        hovering,
        winners,
        creator,
        ranking
    };
});
