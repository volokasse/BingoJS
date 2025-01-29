<script lang="ts">
    import { useWebSocketStore } from '@/stores/websocket';
    import { computed } from 'vue';
    import SmallGrid from './SmallGrid.vue';

    export default {
        components: {
            SmallGrid
        },
        props: {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        mounted() {

        },
        watch: {

        },
        setup() {
            const _webSocketStore = useWebSocketStore();
            const smallGrids      = computed(() => _webSocketStore.otherGrids);
            const gridType        = computed(() => _webSocketStore.gridType);
            const cellHover       = computed(() => _webSocketStore.hovering);
            const winners         = computed(() => _webSocketStore.winners);

            return {
                smallGrids,
                gridType,
                cellHover,
                winners
            }
        }
    }
</script>

<template>
    <div id="small_grids_container" v-if="smallGrids.length > 0">
        <SmallGrid v-for="smallGrid in smallGrids" :key="smallGrid.player.id" :grid="smallGrid.grid" :player="smallGrid.player" :grid_type="gridType" :cellHover="cellHover" :win_state="winners.length > 0 && winners.includes(smallGrid.player.id)" />
    </div>
</template>

<style lang="scss" scoped>
    @use 'sass:color';
    @use '../assets/variables.scss' as *;

    #small_grids_container {
        width: fit-content;
        max-width: 610px;
        margin: 25px auto 0 auto;
        padding: 15px 25px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 25px;
        background-color: color.adjust($color: $c-black, $lightness: 5%);
        border-radius: 5px;
    }
</style>