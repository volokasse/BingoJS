<script lang="ts">
import { BingoType } from '@/enums/BingoType';
import type { BingoCell } from '@/interfaces/Interfaces';
import type { PropType } from 'vue';
import { useWebSocketStore } from '@/stores/websocket';
import { MessageType } from '@/enums/MessageType';

export default {
    props: {
        grid_type: {
            type: Number,
            required: true
        },
        grid: {
            type: Array as PropType<BingoCell[]>,
            required: true
        },
        win_state: {
            type: Boolean,
            required: true
        },
        is_creator: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {

        }
    },
    methods: {
        selectPick(cellID: number)
        {
            // Send pick to server
            const _webSocketStore = useWebSocketStore();
            if (_webSocketStore.player == null)
                return;

            _webSocketStore.sendMessage(MessageType.PICK_CELL, {cell_id: cellID, player_id: _webSocketStore.player.id});
        },
        hoverPick(cellID: number)
        {
            const _webSocketStore = useWebSocketStore();
            if (_webSocketStore.player == null)
                return;

            _webSocketStore.hovering = cellID;
        },
        unhoverPicker()
        {
            const _webSocketStore = useWebSocketStore();
            if (_webSocketStore.player == null)
                return;

            _webSocketStore.hovering = 0;
        }
    },
    mounted() {

    },
    watch: {

    },
    setup() {
        return {
            BingoType
        }
    }
}
</script>

<template>
    <div class="grid-container">
        <div class="grid" :class="{three: grid_type == BingoType.THREExTHREE, five: grid_type == BingoType.FIVExFIVE, win: win_state && !is_creator}">
            <div v-for="cell in grid" :key="cell.id" class="cell" :class="{pick: cell.picked}" @click="selectPick(cell.id)" @mouseenter="hoverPick(cell.id)" @mouseleave="unhoverPicker()">
                <div class="text">
                    {{ cell.value }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @use 'sass:color';
    @use '../assets/variables.scss' as *;

    $var-opacity-percent: -50%;

    .grid-container
    {
        padding: 0;

        .grid
        {
            margin: auto;
            font-size: 0.8rem;

            &.three
            {
                width: 100%;
                max-width: 500px;
                min-height: 500px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                border: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                border-radius: 5px;

                .cell
                {
                    display: flex;
                    justify-content: center;
                    color: var(--c-white);

                    &:nth-child(3n+2)
                    {

                        border-right: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-left: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6)
                    {
                        border-top: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-bottom: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                }
            }
            &.five
            {
                width: 100%;
                max-width: 800px;
                min-height: 800px;
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                border: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                border-radius: 5px;

                .cell
                {
                    display: flex;
                    justify-content: center;
                    color: var(--c-white);

                    &:nth-child(5n+2),
                    &:nth-child(5n+4)
                    {
                        border-right: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-left: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                    &:nth-child(6),
                    &:nth-child(7),
                    &:nth-child(8),
                    &:nth-child(9),
                    &:nth-child(10),
                    &:nth-child(16),
                    &:nth-child(17),
                    &:nth-child(18),
                    &:nth-child(19),
                    &:nth-child(20)
                    {
                        border-top: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-bottom: 3px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                }
            }
            &.win
            {
                pointer-events: none;
            }
            .text
            {
                text-align: center;
                align-self: center;
                color: color.adjust($c-white, $lightness: calc($var-opacity-percent + 35%));
                padding: 5px;
            }
            .cell
            {
                &:hover,
                &.pick
                {
                    cursor: pointer;
                    background-image: url('/img/cross.svg');
                    background-position: center center;
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                }
            }
        }
    }
</style>
