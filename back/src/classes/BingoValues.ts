import { BingoCell } from "../types/Interfaces";

export class BingoValues {
    [key: number]: string;

    constructor() {}

    add(id: number, value: string)
    {
        this[id] = value;
    }

    getValue(Index: number): string | undefined
    {
        return this[Index];
    }

    toObject(): { [key: number]: string }
    {
        const result: { [key: number]: string } = {};

        for (const key in this)
        {
          if (typeof this[key] === 'string')
            result[Number(key)] = this[key];          
        }

        return result;
    }

    count(): number
    {
        return Object.keys(this).filter(key => typeof this[Number(key)] === 'string').length;
    }

    getRandom(): BingoCell
    {
        let randID = Math.floor(Math.random() * (this.count() - 1 + 1)) + 1;
        let pick = this[randID];

        return {id: randID, value: pick, picked: false};
    }
}