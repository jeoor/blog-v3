<script setup lang="ts">
defineProps<{
  image: string
  title: string
  description?: string
}>()
</script>

<template>
<div class="page-banner">
  <NuxtImg class="banner-image" :src="image" :alt="title" format="webp" sizes="(max-width: 768px) 100vw, 1200px" placeholder />
  <div class="banner-content">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
  <div class="banner-extra">
    <slot></slot>
  </div>
</div>
</template>

<style lang="scss" scoped>
.page-banner {
  border-radius: 8px;
  margin: 1rem;
  max-height: 320px;
  min-height: 256px;
  overflow: hidden;
  position: relative;

  .banner-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-content {
    color: #eee;
    display: flex;
    flex-direction: column;
    top: 0;
    bottom: 0;
    left: 0;
    justify-content: space-between;
    padding: 1rem;
    position: absolute;
    text-shadow: 0 4px 5px rgba(#000, .5);
    z-index: 1;

    p {
      opacity: .9;
    }
  }

  .banner-extra {
    align-items: flex-end;
    display: flex;
    bottom: 0;
    right: 0;
    justify-content: flex-end;
    margin: 1rem;
    position: absolute;
    z-index: 1;
  }
}
</style>
