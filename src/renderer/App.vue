<template>
  <div class="__layout">
    <home></home>
  </div>
</template>

<script>
  import { view as Home } from '@/views/home';
  export default {
    components: {
      'home': Home
    }
  }
</script>
