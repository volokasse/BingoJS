<script lang="ts">
import type { BingoCell } from '@/interfaces/Interfaces';
import { BingoType } from '@/enums/BingoType';
import type { PropType } from 'vue';
import { Player } from "@/classes/Player";

export default {
    props: {
        player: {
            type: Object as PropType<Player>,
            required: true
        },
        grid: {
            type: Array as PropType<BingoCell[]>,
            required: true
        },
        grid_type: {
            type: Number,
            required: true
        },
        cellHover: {
            type: Number,
            required: false
        },
        win_state: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {

        }
    },
    computed: {

    },
    methods: {

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
    <div class="small_grid">
        <div class="player_name">
            <div class="name">
                {{ player.name }}
            </div>
            <div class="crown" v-if="win_state">
                👑
            </div>
        </div>
        <div class="grid" :class="grid_type == BingoType.THREExTHREE ? 'three' : 'five'">
            <div v-for="cell in grid" :key="cell.id" class="cell" :class="{pick: cell.picked, hover: cellHover == cell.id}">
                <div class="text"> . </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @use 'sass:color';
    @use '../assets/variables.scss' as *;

    $var-opacity-percent: -50%;

    .small_grid
    {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .player_name
        {
            display: flex;
            align-items: center;
            justify-content: center;
            padding-bottom: 5px;

            .name
            {
                color: white;
                text-align: center;
            }
            .crown
            {
                position: relative;
                bottom: 1px;
            }
        }
        .grid
        {
            &.three
            {
                width: 100px;
                height: 100px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                border: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                border-radius: 5px;

                .cell
                {
                    &:nth-child(3n+2)
                    {

                        border-right: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-left: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6)
                    {
                        border-top: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-bottom: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                }
            }
            &.five
            {
                width: 100px;
                height: 100px;
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                border: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                border-radius: 5px;

                .cell
                {
                    &:nth-child(5n+2),
                    &:nth-child(5n+4)
                    {
                        border-right: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-left: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
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
                        border-top: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                        border-bottom: 1px solid color.adjust($c-white, $lightness: $var-opacity-percent);
                    }
                }
            }
            .cell
            {
                &.pick
                {
                    background-image: url('/img/cross.svg');
                    background-position: center center;
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                }
                &.hover
                {
                    background-color: $c-blue;
                }
            }
        }
    }
</style>