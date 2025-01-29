export class Player {
    id: number;
    name: string;

    constructor(id: number, name: string)
    {
        this.id = id;
        this.name = name;
    }

    toObject(): { id: number, name: string} {
        return {
            id: this.id,
            name: this.name
        };
    }
}