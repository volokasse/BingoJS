<script lang="ts">
import { useWebSocketStore } from '@/stores/websocket';
import { RouterLink, RouterView } from 'vue-router';

export default {
  components: {

  },
  data() {
      return {

      }
  },
  methods: {

  },
  mounted() {
    const _webSocketStore = useWebSocketStore();
    _webSocketStore.connect();
  },
  unmounted() {
    const _webSocketStore = useWebSocketStore();
    _webSocketStore.disconnect();
  },
  watch: {

  }
}
</script>

<template>
  <div id="container">
    <header>

    </header>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
  #container
  {
    width: 100%;
    max-width: 1080px;
    margin: auto;
  }
</style>
