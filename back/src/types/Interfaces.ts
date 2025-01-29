import { Player } from "../classes/Player"

export interface BingoCell {
    id: number,
    value: string,
    picked: boolean
}
export interface Grid {
    player: Player,
    grid: BingoCell[]
}
export interface PlayerDB {
    id: number,
    name: string
}
export interface CellDB {
    id: number,
    text: string
}