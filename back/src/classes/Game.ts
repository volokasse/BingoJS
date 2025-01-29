import { BingoType } from "../enums/BingoType";
import { BingoCell, Grid, PlayerDB, CellDB } from "../types/Interfaces";
import { BingoValues } from "./BingoValues";
import { Player } from "./Player";
import mysql from 'mysql2/promise';

export class Game {
    grids: { [key: number]: BingoCell[] };
    bingoSize: number;
    isGameStarted: boolean;
    bingoValues: BingoValues;
    bingoType: BingoType;
    cells: number[];
    players: Player[];
    creator: number;
    pickHistory: number[];

    constructor()
    {
        this.grids         = {};
        this.bingoSize     = 5;
        this.bingoType     = BingoType.NONE;
        this.isGameStarted = false;
        this.cells         = [];
        this.creator       = 0;
        this.pickHistory   = [];
        this.players       = [];
        this.bingoValues   = new BingoValues();
    }

    async init(_db: mysql.Connection)
    {
        // Load players
        let playersQuery = "SELECT * FROM players ORDER BY id ASC";
        let [playersResult] = await _db.execute(playersQuery);

        for (let playerIdx in playersResult)
        {
            let player = (playersResult as PlayerDB[])[parseInt(playerIdx)];
            this.players.push(new Player(player.id, player.name));
        }

        // Load cells
        let cellsQuery = "SELECT * FROM cells";
        let [cellsResult] = await _db.execute(cellsQuery);

        for (let cellIdx in cellsResult)
        {
            let cell = (cellsResult as CellDB[])[parseInt(cellIdx)];
            this.bingoValues.add(cell.id, cell.text);
        }
    }

    getPlayer(playerID: number): Player | undefined
    {
        return this.players.find(player => player.id === playerID);
    }

    getPlayersListSerialized()
    {
        let players = [];
        for(let player of this.players)
            players.push(player.toObject());
        return players;
    }

    addPlayer(playerID: number): boolean
    {
        // Start game
        if (!this.isGameStarted)
        {
            this.creator       = playerID;
            this.isGameStarted = true;
        }

        // Check player in game, if not generate grid
        if (!(playerID in this.grids))
        {
            let numberPicked = 0;
            let numberToPick = this.bingoSize * this.bingoSize;
            let grid: BingoCell[] = [];

            while (numberPicked < numberToPick)
            {
                let pick = this.bingoValues.getRandom();
                if (!grid.some(cell => cell.id === pick.id))
                {
                    grid.push(pick);
                    numberPicked++;
                }
            }

            this.grids[playerID] = grid;
            this.refreshGrids();
            return true;
        }
        return false;
    }

    getGridOfPlayer(playerID: number)
    {
        if (!this.playerExist(playerID))
            this.addPlayer(playerID);

        return this.grids[playerID];
    }

    getGrids()
    {
        let otherGrids: Grid[] = [];
        for (let gridIdx in this.grids)
        {
            let grid = this.grids[gridIdx];
            let player = this.players.find(player => player.id === parseInt(gridIdx));
            if (player !== undefined)
                otherGrids.push({player: player, grid: grid} as Grid);
        }
        return otherGrids;
    }

    playerExist(playerID: number)
    {
        return this.players.find(player => player.id === playerID) !== undefined;
    }

    isRunning(): boolean
    {
        return this.isGameStarted;
    }

    setGridSize(sizeType: number)
    {
        this.bingoType = sizeType;
        if (sizeType == BingoType.THREExTHREE)
            this.bingoSize = 3;
        else
            this.bingoSize = 5;

        return this.bingoSize;
    }

    getBingoType(): number
    {
        return this.bingoType;
    }

    pickCell(cellID: number, undo?: boolean)
    {
        if (this.cells.includes(cellID))
        {
            const index = this.cells.indexOf(cellID);
            this.cells.splice(index, 1);
        }
        else
            this.cells.push(cellID);

        if (!undo)
            this.pickHistory.push(cellID);

        this.refreshGrids();
        return this;
    }

    undoPick()
    {
        let lastPick = this.pickHistory.pop();
        if (lastPick !== undefined)
            this.pickCell(lastPick, true);

        return this;
    }

    refreshGrids()
    {
        // Update all grids
        for (let playerGridIdx in this.grids)
        {
            let grid = this.grids[playerGridIdx];
            for (let cell of grid)
                cell.picked = this.cells.includes(cell.id);
        }
        return this;
    }

    getWinners()
    {
        let winners: number[] = [];

        // Check if a player has won
        for (let playerGridIdx in this.grids)
        {
            // Columns & rows
            let grid = this.grids[playerGridIdx];
            for (let i = 0; i < this.bingoSize; i++)
            {
                let rowWon = true;
                let colWon = true;
                for (let j = 0; j < this.bingoSize; j++)
                {
                    if (!grid[i * this.bingoSize + j].picked)
                        rowWon = false;
                    if (!grid[j * this.bingoSize + i].picked)
                        colWon = false;
                }
                if (rowWon || colWon)
                    winners.push(parseInt(playerGridIdx));
            }

            // Diagonals
            let diag1Won = true;
            let diag2Won = true;
            for (let i = 0; i < this.bingoSize; i++)
            {
                if (!grid[i * this.bingoSize + i].picked)
                    diag1Won = false;
                if (!grid[i * this.bingoSize + this.bingoSize - 1 - i].picked)
                    diag2Won = false;
            }
            if (diag1Won || diag2Won)
                winners.push(parseInt(playerGridIdx));
        }

        return winners;
    }

    getCreator()
    {
        return this.creator;
    }

    async end(_db: mysql.Connection)
    {
        // Save game for history purpose
        let grids        = JSON.stringify(this.grids);
        let grid_type    = this.bingoType;
        let creator_id   = this.creator;
        let pick_history = this.pickHistory.toString();

        try
        {
            // Save game in history
            let queryHistory  = "INSERT INTO games_history(`grids`, `grid_type`, `creator_id`, `pick_history`) VALUES (?, ?, ?, ?)";
            let valuesHistory = [grids, grid_type, creator_id, pick_history];
    
            let [resultsHistory] = await _db.execute(queryHistory, valuesHistory);
            let gameId = (resultsHistory as mysql.ResultSetHeader).insertId;

            // Save winners
            let queryWinners = "INSERT INTO games_winners(`game_id`, `winner_id`) VALUES ";
            let queryWinnersArr = [];
            let valuesWinners = [];
            for (let winnerId of this.getWinners())
            {
                queryWinnersArr.push("(?, ?)");
                valuesWinners.push(gameId);
                valuesWinners.push(winnerId);
            }

            queryWinners += queryWinnersArr.join(",");
            let [resultWinners] = await _db.execute(queryWinners, valuesWinners);
        }
        catch(error)
        {
            console.log(error);
        }
    }

    reset()
    {
        this.grids         = {};
        this.bingoSize     = 5;
        this.bingoType     = BingoType.NONE;
        this.isGameStarted = false;
        this.cells         = [];
        this.creator       = 0;
        this.pickHistory   = [];
    }

    async getRanking(_db: mysql.Connection)
    {
        let queryRanking    = "SELECT winner_id, COUNT(*) AS total FROM games_winners GROUP BY winner_id ORDER BY total DESC";
        let [valuesRanking] = await _db.execute<mysql.RowDataPacket[]>(queryRanking);
        return valuesRanking;
    }
}