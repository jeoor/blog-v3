<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { EssayImage, EssayItem } from '~/types/essay'
import type { WidgetName } from '~/composables/useWidgets'
import essays from '~/essay'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
const essayAsideWidgets: WidgetName[] = ['blog-stats', 'blog-tech', 'countdown']
const essayAsidePlaceholder: WidgetName[] = ['empty']
const essayAsideWidescreenQuery = '(min-width: 1081px)'

layoutStore.setAside(essayAsidePlaceholder)

const title = '日记'
const description = '记录生活点滴和一些想法。'
const image = '/assets/essay-banner.webp'
const ogImage = new URL(image, appConfig.url).href
useSeoMeta({ title, description, ogImage })

const { author } = appConfig
const PostCommentAsync = defineAsyncComponent(() => import('~/components/post/Comment.vue'))
const commentAnchor = useTemplateRef('comment-anchor')
const shouldRenderComment = ref(false)
const commentReplyContent = ref('')
const commentFocusSeq = ref(0)

if (import.meta.client) {
  type IdleWindow = Window & typeof globalThis
  const browser = globalThis as IdleWindow
  let asideObserver: IntersectionObserver | undefined
  let asideTimerId: number | undefined
  let asideRestored = false
  let commentObserver: IntersectionObserver | undefined
  let commentRenderQueued = false

  const restoreAside = () => {
    if (asideRestored)
      return

    asideRestored = true
    asideObserver?.disconnect()
    asideObserver = undefined

    if (asideTimerId !== undefined) {
      browser.clearTimeout(asideTimerId)
      asideTimerId = undefined
    }

    layoutStore.setAside(essayAsideWidgets)
  }

  const showCommentSection = () => {
    if (shouldRenderComment.value || commentRenderQueued)
      return

    commentObserver?.disconnect()
    commentObserver = undefined
    commentRenderQueued = true

    queueMicrotask(() => {
      commentRenderQueued = false
      shouldRenderComment.value = true
    })
  }

  onMounted(() => {
    if (browser.matchMedia(essayAsideWidescreenQuery).matches) {
      restoreAside()
    } else {
      if (commentAnchor.value && typeof browser.IntersectionObserver === 'function') {
        asideObserver = new browser.IntersectionObserver((entries) => {
          if (entries.some(entry => entry.isIntersecting))
            restoreAside()
        }, { rootMargin: '960px 0px' })

        asideObserver.observe(commentAnchor.value)
      } else {
        asideTimerId = browser.setTimeout(restoreAside, 1500)
      }
    }

    if (!commentAnchor.value) {
      shouldRenderComment.value = true
      return
    }

    if (typeof browser.IntersectionObserver !== 'function') {
      shouldRenderComment.value = true
      return
    }

    commentObserver = new browser.IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting))
        showCommentSection()
    }, { rootMargin: '320px 0px' })

    commentObserver.observe(commentAnchor.value)
  })

  onBeforeUnmount(() => {
    asideObserver?.disconnect()
    commentObserver?.disconnect()

    if (asideTimerId === undefined)
      return

    browser.clearTimeout(asideTimerId)
  })
}

const recentEssays: EssayItem[] = [...essays]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 30)

async function replyEssay(content?: string): Promise<void> {
  shouldRenderComment.value = true
  commentReplyContent.value = content?.trim() || ''

  await nextTick()

  commentAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  commentFocusSeq.value += 1
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
      <NuxtImg class="avatar" :src="author.avatar" :alt="author.name" width="48" height="48" sizes="48px" decoding="async" />
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
      <button class="comment-btn" title="评论" aria-label="评论" @click="replyEssay(essay.text)">
        <Icon name="ph:chats-bold" />
      </button>
    </div>
  </div>

  <div class="essay-footer">
    <p>仅显示最近 30 条记录</p>
  </div>

  <div ref="comment-anchor" class="comment-section">
    <button v-if="!shouldRenderComment" class="comment-entry card" @click="replyEssay()">
      展开评论区
    </button>
    <PostCommentAsync v-else :initial-reply="commentReplyContent" :focus-seq="commentFocusSeq" />
  </div>
</div>
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

  .comment-section {
    margin-top: 2rem;
  }

  .comment-entry {
    display: block;
    width: min(100%, 20rem);
    margin: 0 auto;
    padding: 0.9rem 1rem;
    border-radius: 0.75rem;
    color: var(--c-text-2);
    transition: transform .2s, box-shadow .2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--box-shadow-1);
    }
  }
}
</style>
