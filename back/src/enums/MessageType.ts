export enum MessageType
{
    NONE                  = 0x000,
    INIT                  = 0x001,
    GENERATE_BINGO        = 0x002,
    GENERATE_BINGO_RESULT = 0x003,
    PICK_CELL             = 0x004,
    PICK_CELL_RESULT      = 0x005,
    JOIN_BINGO            = 0x006,
    JOIN_BINGO_RESULT     = 0x007,
    UPDATE_GRIDS          = 0x008,
    UPDATE_GRIDS_RESULT   = 0x009,
    CHECK_GAME            = 0x00A,
    CHECK_GAME_RESULT     = 0x00B,
    UNDO_PICK             = 0x00C,
    UNDO_PICK_RESULT      = 0x00D,
    END_GAME              = 0x00E,
    END_GAME_RESULT       = 0x00F
}