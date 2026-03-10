<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  image?: string
  title: string
  description?: string
}>()

const bannerImageSrc = computed(() => {
  if (!props.image)
    return ''

  if (!/^https?:\/\//.test(props.image) || props.image.startsWith('https://wsrv.nl/?'))
    return props.image

  const params = new URLSearchParams({
    url: props.image,
    w: '1280',
    h: '320',
    fit: 'cover',
    output: 'webp',
    q: '76',
  })

  return `https://wsrv.nl/?${params.toString()}`
})
</script>

<template>
<div class="page-banner" :class="{ 'no-image': !image }">
  <img v-if="image" class="banner-image" :src="bannerImageSrc" :alt="title" width="1200" height="320" loading="eager" fetchpriority="high" decoding="async">
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

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(#0b1220, .16), rgba(#0b1220, .56));
    z-index: 0;
  }

  &.no-image {
    background:
      radial-gradient(circle at top right, rgba(#fff, .18), transparent 28%),
      linear-gradient(135deg, #2a4158, #1f3044 45%, #111f2f);

    &::before {
      content: '';
      position: absolute;
      inset: auto -6rem -7rem auto;
      width: 18rem;
      aspect-ratio: 1;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(#fff, .18), transparent 70%);
      z-index: 0;
    }
  }

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
