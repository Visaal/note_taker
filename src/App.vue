<template>
  <div id="app">
    <app-header></app-header>
    <div id="contents">
      <router-view/>
    </div>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
export default {
  name: 'App',
  components: {
    'app-header': AppHeader
  }
}
</script>

<style lang="scss">

  @import '~bulma';
  @import '~bulma-tooltip';

  .columns{
    flex-wrap: wrap
  }

  #contents {
    padding-left: 1%;
    padding-right: 1%;
    padding-top: 15px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // margin-top: 60px;
  }
</style>
