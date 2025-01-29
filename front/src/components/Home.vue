<script lang="ts">
    import Grid from './Grid.vue';
    import SmallGridsContainer from './SmallGridsContainer.vue';
    import { useWebSocketStore } from '@/stores/websocket';
    import { BingoType } from '@/enums/BingoType';
    import { MessageType } from '@/enums/MessageType';
    import { computed } from 'vue';
    import type { Ranking, Rank } from '@/interfaces/Interfaces';

    export default {
        components: {
            Grid,
            SmallGridsContainer
        },
        data() {
            return {
                bingo_type: BingoType.THREExTHREE,
                bingo_player: 0
            }
        },
        methods: {
            generate_bingo()
            {
                const _webSocketStore = useWebSocketStore();

                if (this.bingo_player != 0)
                    _webSocketStore.sendMessage(MessageType.GENERATE_BINGO, {type: this.bingo_type, player: this.bingo_player});
            },
            join_bingo()
            {
                const _webSocketStore = useWebSocketStore();

                if (this.bingo_player != 0)
                    _webSocketStore.sendMessage(MessageType.JOIN_BINGO, {player: this.bingo_player});
            },
            undoPick()
            {
                const _webSocketStore = useWebSocketStore();
                _webSocketStore.sendMessage(MessageType.UNDO_PICK, {});
            },
            endGame()
            {
                const _webSocketStore = useWebSocketStore();
                _webSocketStore.sendMessage(MessageType.END_GAME, {});
            }
        },
        computed: {
            isWinState()
            {
                return this.winners !== undefined && this.winners.length > 0;
            },
            isCreator()
            {
                return this.player !== null && this.creator === this.player.id;
            },
            rankingValues()
            {
                if (this.ranking == null)
                    return [];

                let ranking = [];
                let count   = 0;
                for (let rankIdx in this.ranking as Ranking)
                {
                    let rankVal  = (this.ranking as Ranking)[parseInt(rankIdx)];
                    let rankName = this.players.find(value => value.id == rankVal.winner_id);

                    if ((this.ranking as Ranking)[parseInt(rankIdx) - 1] === undefined || (this.ranking as Ranking)[parseInt(rankIdx) - 1].total != rankVal.total)
                        count++;

                    ranking.push({
                        name: rankName === undefined ? '' : rankName.name,
                        class: "rank_" + count,
                        total: rankVal.total
                    });
                }

                return ranking;
            }
        },
        mounted() {

        },
        watch: {
            isRunning(newValue)
            {
                if (newValue === false)
                {
                    this.bingo_player = 0;   
                    this.bingo_type   = BingoType.THREExTHREE;
                }
            }
        },
        setup() {
            const _webSocketStore = useWebSocketStore();

            const bingo_cells     = computed(() => _webSocketStore.grid);
            const bingo_game_type = computed(() => _webSocketStore.gridType);
            const isRunning       = computed(() => _webSocketStore.isRunning);
            const player          = computed(() => _webSocketStore.player);
            const winners         = computed(() => _webSocketStore.winners);
            const creator         = computed(() => _webSocketStore.creator);
            const ranking         = computed(() => _webSocketStore.ranking);

            return {
                players: _webSocketStore.players,
                BingoType,
                bingo_game_type,
                bingo_game_player: _webSocketStore.player,
                bingo_cells,
                isRunning,
                player,
                winners,
                creator,
                ranking
            }
        }
    }
</script>

<template>
    <div v-if="!isRunning" class="form_create">
        <select v-model="bingo_player">
            <option value="0" selected disabled hidden> - </option>
            <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }}
            </option>
        </select>
        <select v-model="bingo_type">
            <option :value="BingoType.THREExTHREE" default> 3x3 </option>
            <option :value="BingoType.FIVExFIVE"> 5x5 </option>
        </select>
        <div id="create_session" class="btn margin auto" @click="generate_bingo">
            Créer une session
        </div>
    </div>
    <div v-if="isRunning" class="form_join" :class="{creator: isCreator}">
        <select v-model="bingo_player" @change="join_bingo">
            <option value="0" selected disabled hidden> - </option>
            <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }}
            </option>
        </select>
        <div class="actions" v-if="isCreator">
            <div class="btn" @click="endGame()">
                Terminer la partie
            </div>
            <div class="undo" @click="undoPick">
                <img src="/img/undo.svg" alt="Undo" />
            </div>
        </div>
    </div>
    <div class="winner" v-if="player !== null && winners !== undefined && winners.includes(player.id)">
        👑
    </div>
    <ul class="ranking">
        <li v-if="ranking != null && player === null" v-for="rank in rankingValues" :class="rank.class">
            {{ rank.name }} - {{ rank.total }}
        </li>
    </ul>
    <Grid v-if="isRunning && bingo_cells.length > 0" :grid_type="bingo_game_type" :grid="bingo_cells" :win_state="isWinState" :is_creator="isCreator"/>
    <SmallGridsContainer v-if="isRunning" />
</template>

<style lang="scss" scoped>
    @use 'sass:color';
    @use '../assets/variables.scss' as *;

    .form_create
    {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 15px;
        padding: 25px 0;
    }
    .form_join
    {
        max-width: 500px;
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        column-gap: 5px;
        row-gap: 15px;
        padding: 25px 0;

        &.creator
        {
            justify-content: space-between;

            .actions
            {
                display: flex;
                column-gap: 5px;

                .undo
                {
                    width: calc(34px - 5px * 2);
                    height: calc(34px - 5px * 2);
                    padding: 5px;
                    cursor: pointer;
                    background-color: $c-grey;
                    transition: all .3s ease-in-out;

                    &:hover
                    {
                        background-color: color.adjust($color: $c-grey, $lightness: 5%);
                    }
                    img
                    {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
        select
        {
            display: block;
            width: fit-content;
        }
    }
    .winner
    {
        text-align: center;
        font-size: 2rem;
    }
    select
    {
        appearance: none;
        border: 0;
        outline: 0;
        font: inherit;
        width: fit-content;
        padding: 0.5rem 2rem 0.5rem 0.5rem;
        background: url("/img/select_arrow.svg") no-repeat right 0.3em center/1em, linear-gradient(to left, rgba(255, 255, 255, 0.3) 1.5em, rgba(255, 255, 255, 0.2) 1.5em);
        color: white;
        border-radius: 0.25em;
        box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
        cursor: pointer;

        // Remove IE arrow
        &::-ms-expand
        {
            display: none;
        }
        // Remove focus outline
        &:focus
        {
            outline: none;
        }
        // <option> colors
        option
        {
            color: inherit;
            background-color: $c-grey;
        }
    }
    .ranking
    {
        list-style-type: none;
        color: white;
        text-align: center;
        padding: 0;

        li
        {
            padding: 3px 0;

            &.rank_1
            {
                font-size: 1.6rem;
                color: $c-gold;
                padding: 10px 0;

                &::before
                {
                    content: '🥇';
                }
            }
            &.rank_2
            {
                font-size: 1.4rem;
                color: $c-silver;
                padding: 10px 0;

                &::before
                {
                    content: '🥈';
                }
            }
            &.rank_3
            {
                font-size: 1.2rem;
                color: $c-bronze;
                padding: 10px 0 20px 0;

                &::before
                {
                    content: '🥉';
                }
            }
        }
    }
</style>
