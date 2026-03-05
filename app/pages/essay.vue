<script setup lang="ts">
import type { EssayImage, EssayItem } from '~/types/essay'
import essays from '~/essay'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'tag-cloud', 'countdown'])

const title = '日记'
const description = '记录生活点滴和一些想法。'
const image = 'https://bu.dusays.com/2026/03/05/69a99d3fe44f3.webp'
useSeoMeta({ title, description, ogImage: image })

const { author } = useAppConfig()

const recentEssays: EssayItem[] = [...essays]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 30)

function replyEssay(content?: string): void {
  const input = document.querySelector('#twikoo .tk-input textarea')
  if (!(input instanceof HTMLTextAreaElement)) return

  if (content?.trim()) {
    const quotes = content.split('\n').map(str => `> ${str}`)
    input.value = `${quotes}\n\n`
  } else {
    input.value = ''
  }
  input.dispatchEvent(new InputEvent('input'))

  const length = input.value.length
  input.setSelectionRange(length, length)
  input.focus()
}

function getEssayDate(date?: string | Date) {
  if (!date) {
    return ''
  }
  
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  return toZdtLocaleString(dateStr, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(/\//g, '-')
}

function getEssayImageSrc(image: EssayImage) {
  return typeof image === 'string' ? image : image.src
}

function getEssayImageAlt(image: EssayImage) {
  return typeof image === 'string' ? '' : (image.alt || '')
}

function getEssayImageWidth(image: EssayImage) {
  return typeof image === 'string' ? undefined : image.width
}

function getEssayImageHeight(image: EssayImage) {
  return typeof image === 'string' ? undefined : image.height
}

function getEssayImageStyle(image: EssayImage, isSingle: boolean) {
  if (!isSingle || typeof image === 'string' || image.width === undefined)
    return undefined

  return {
    width: typeof image.width === 'number' ? `${image.width}px` : image.width,
    maxWidth: '100%',
  }
}
</script>

<template>
<ZPageBanner :title :description :image />

<div class="essay-list">
  <div class="essay-item" v-for="essay in recentEssays" :key="essay.date">
    <div class="essay-meta">
      <NuxtImg class="avatar" :src="author.avatar" :alt="author.name" />
      <div class="info">
        <div class="nick">
          {{ author.name }}
          <Icon class="verified" name="i-material-symbols:verified" />
        </div>
        <div class="date">{{ getEssayDate(essay.date) }}</div>
      </div>
    </div>

    <div class="essay-content">
      <div class="text" v-if="essay.text" v-html="essay.text"></div>
      <div class="images" v-if="essay.images?.length" :class="{ single: essay.images.length === 1 }">
        <Pic
          class="image"
          v-for="(image, index) in essay.images"
          :key="`${getEssayImageSrc(image)}-${index}`"
          :src="getEssayImageSrc(image)"
          :alt="getEssayImageAlt(image)"
          :width="getEssayImageWidth(image)"
          :height="getEssayImageHeight(image)"
          :style="getEssayImageStyle(image, essay.images.length === 1)"
        />
      </div>
      <div class="essay-link-cards" v-if="essay.linkCards?.length">
        <article v-for="(card, index) in essay.linkCards" :key="`${card.link}-${index}`">
          <LinkCard v-bind="card" />
        </article>
      </div>
      <VideoEmbed class="video" v-if="essay.video" v-bind="essay.video" height="" />
    </div>

    <div class="essay-bottom">
      <div class="tags">
        <span class="tag" v-for="tag in essay.tags">
          <Icon name="ph:tag-bold" />
          <span>{{ tag }}</span>
        </span>
      </div>
      <button class="comment-btn" v-tip="'评论'" @click="replyEssay(essay.text)">
        <Icon name="ph:chats-bold" />
      </button>
    </div>
  </div>

  <div class="essay-footer">
    <p>仅显示最近 30 条记录</p>
  </div>
</div>

<PostComment />
</template>

<style lang="scss" scoped>
.essay-list {
  animation: float-in .2s backwards;
  margin: 1rem;

  .essay-item {
    animation: float-in .3s backwards;
    animation-delay: var(--delay);
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: 1rem;
    padding: 1rem;

    .essay-meta {
      align-items: center;
      display: flex;
      gap: 10px;

      .avatar {
        border-radius: 50%;
        box-shadow: 2px 4px 1rem var(--ld-shadow);
        width: 3em;

        @supports (corner-shape: squircle) {
          corner-shape: superellipse(1.2);
         }
      }

      .nick {
        align-items: center;
        display: flex;
        gap: 5px;
      }

      .date {
        color: var(--c-text-3);
        font-family: var(--font-monospace);
        font-size: .8rem;
      }

      .verified {
        color: var(--c-primary);
        font-size: 16px;
      }
    }

    .essay-content {
      color: var(--c-text-2);
      display: flex;
      flex-direction: column;
      gap: .5rem;
      line-height: 1.6;

      .text :deep(a[href]) {
        margin: -.1em -.2em;
        padding: .1em .2em;
        background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center bottom / 100% .1em;
        color: var(--c-primary);
        transition: all .2s;

        &:hover {
          border-radius: 8px;
          background-size: 100% 100%;
        }
      }

      .images {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(3, 1fr);

        &.single {
          display: block;

          .image {
            max-width: min(100%, 28rem);
            padding-bottom: 0;
            position: static;

            :deep(img) {
              display: block;
              height: auto;
              object-fit: contain;
              position: static;
              width: 100%;
            }
          }
        }
      }

      .image {
        border-radius: 8px;
        overflow: hidden;
        padding-bottom: 100%;
        position: relative;

        :deep(img) {
          height: 100%;
          object-fit: cover;
          position: absolute;
          transition: transform .3s;
          width: 100%;

          &:hover {
            transform: scale(1.05);
          }
        }
      }

      .essay-link-cards > article :deep(.link-card) {
        margin: .5rem 0;
      }

      .video {
        border-radius: 8px;
        margin: 0;
      }
    }

    .essay-bottom {
      align-items: center;
      color: var(--c-text-3);
      display: flex;
      justify-content: space-between;

      .tags {
        display: flex;
        font-size: .7rem;
        gap: 4px;
      }

      .tag {
        display: flex;
        padding: 2px 4px;
        border-radius: 8px;
        background-color: var(--c-bg-2);
        align-items: center;
        cursor: pointer;
        transition: all .2s;

        &:hover {
          opacity: .8;
        }
      }

      .tag .i-ph\:tag-bold + * {
        margin-left: .15em;
      }
    }
  }

  .essay-footer {
    color: var(--c-text-3);
    font-size: 1rem;
    margin: 2rem 0;
    text-align: center;
  }
}
</style>
