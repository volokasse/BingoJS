import type { Player } from "@/classes/Player";

export interface BingoCell {
    id: number,
    value: string,
    picked: boolean
}
export interface Grid {
    player: Player,
    grid: BingoCell[]
}
export interface Rank {
    winner_id: number,
    total: number
}
export interface Ranking {
    [index: number]: Rank;
}