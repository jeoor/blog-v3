<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside([])

const title = '留言'
const description = '欢迎在这里留言交流。'
const image = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80'
useSeoMeta({ title, description, ogImage: image })
</script>

<template>
<ZPageBanner :title :description :image />

<div class="message-intro">
	<p>有想法、建议或想打个招呼，都可以在下方留言。</p>
</div>

<PostComment />
</template>

<style lang="scss" scoped>
.message-intro {
	margin: 1rem;
	color: var(--c-text-2);
}
</style>
