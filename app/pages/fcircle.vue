<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { WidgetName } from '~/composables/useWidgets'

interface FriendCircleApiItem {
  title: string
  link: string
  author: string
  created: string
  avatar: string
}

interface FriendCircleArticle extends FriendCircleApiItem {
  id: string
}

interface FriendCircleApiResponse {
  article_data?: FriendCircleApiItem[]
  statistical_data?: {
    last_updated_time?: string
  }
}

const layoutStore = useLayoutStore()
const fcircleAsideWidgets: WidgetName[] = ['blog-stats', 'blog-tech', 'countdown']
const fcircleAsidePlaceholder: WidgetName[] = ['empty']
const fcircleAsideWidescreenQuery = '(min-width: 1081px)'

layoutStore.setAside(fcircleAsidePlaceholder)

const title = '朋友圈'
const description = '发现更多有趣的博主。'
const image = '/assets/fcircle-banner.webp'
const ogImage = 'https://bu.dusays.com/2026/03/05/69a99d24ab46c.webp'
useSeoMeta({ title, description, ogImage })

// 配置选项
const UserConfig = reactive({
  api_url: 'https://fc.kayro.cn/',
  page_size: 20
})

// 状态管理
const allArticles = ref<FriendCircleArticle[]>([])
const displayCount = ref(20)
const isLoading = ref(true)
const randomArticle = ref<FriendCircleArticle | null>(null)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const selectedAuthorAvatar = ref('')
const selectedArticleLink = ref('')
const articlesByAuthor = ref<Record<string, FriendCircleArticle[]>>({})
const lastUpdatedDate = ref('')

// 计算属性
const displayedArticles = computed(() => allArticles.value.slice(0, displayCount.value))
const hasMoreArticles = computed(() => allArticles.value.length > displayCount.value)

function getOptimizedImageUrl(src: string, options?: {
  width?: number
  height?: number
  fit?: 'cover' | 'contain'
  quality?: number
}) {
  if (!src || !/^https?:\/\//.test(src) || src.startsWith('https://wsrv.nl/?'))
    return src

  const params = new URLSearchParams({
    url: src,
    output: 'webp',
    q: String(options?.quality ?? 78),
  })

  if (options?.width)
    params.set('w', String(options.width))

  if (options?.height)
    params.set('h', String(options.height))

  if (options?.fit)
    params.set('fit', options.fit)

  return `https://wsrv.nl/?${params.toString()}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''

  return toZdtLocaleString(dateString, 'date').replace(/\//g, '-')
}

// 刷新随机文章
const refreshRandomArticle = () => {
  if (allArticles.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * allArticles.value.length)
    randomArticle.value = allArticles.value[randomIndex] ?? null
  }
}

// 加载更多
const loadMore = () => {
  displayCount.value += UserConfig.page_size
}

// 模态框相关
const showAvatarPosts = (author: string, avatar: string, articleLink: string) => {
  selectedAuthor.value = author
  selectedAuthorAvatar.value = avatar
  selectedArticleLink.value = articleLink
  showAvatarPopup.value = true
}

const closeAvatarPopup = () => {
  showAvatarPopup.value = false
}

// 监听点击外部关闭弹窗
const handleClickOutside = (event: MouseEvent) => {
  const popup = document.getElementById('avatar-popup')
  if (popup && event.target instanceof Node && !popup.contains(event.target) && showAvatarPopup.value) {
    closeAvatarPopup()
  }
}

// 获取数据
const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await fetch(`${UserConfig.api_url}all.json`)
    const data = await response.json() as FriendCircleApiResponse
    const rawArticles = Array.isArray(data.article_data) ? data.article_data : []
    const apiLastUpdatedTime = data.statistical_data?.last_updated_time

    if (apiLastUpdatedTime)
      lastUpdatedDate.value = apiLastUpdatedTime

    // 处理数据
    allArticles.value = rawArticles.map((item, index) => ({
      id: `${item.link}-${index}`,
      title: item.title,
      link: item.link,
      author: item.author,
      created: item.created,
      avatar: item.avatar,
    }))

    // 按作者分组
    articlesByAuthor.value = allArticles.value.reduce<Record<string, FriendCircleArticle[]>>((acc, article) => {
      const list = acc[article.author] ?? (acc[article.author] = [])
      list.push(article)
      return acc
    }, {})

    // 初始化随机文章
    refreshRandomArticle()

    // 设置最新更新日期
    if (!lastUpdatedDate.value && allArticles.value.length > 0) {
      const sortedArticles = [...allArticles.value].sort((a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
      )
      const latest = sortedArticles[0]
      if (latest)
        lastUpdatedDate.value = formatDate(latest.created)
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 生命周期钩子
if (import.meta.client) {
  type IdleWindow = Window & typeof globalThis
  const browser = globalThis as IdleWindow
  let idleId: number | undefined

  const restoreAside = () => {
    idleId = undefined
    layoutStore.setAside(fcircleAsideWidgets)
  }

  onMounted(() => {
    if (browser.matchMedia(fcircleAsideWidescreenQuery).matches) {
      restoreAside()
      return
    }

    if (typeof browser.requestIdleCallback === 'function') {
      idleId = browser.requestIdleCallback(restoreAside, { timeout: 1200 })
      return
    }

    idleId = browser.setTimeout(restoreAside, 300)
  })

  onUnmounted(() => {
    if (idleId === undefined)
      return

    if (typeof browser.cancelIdleCallback === 'function') {
      browser.cancelIdleCallback(idleId)
      return
    }

    browser.clearTimeout(idleId)
  })
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <ZPageBanner :title :description :image>
    <div class="fcircle-stats">
      <div class="fcircle-stats__update-time">更新于 {{ lastUpdatedDate || '--' }}</div>
      <div class="fcircle-stats__powered-by">由 FriendCircleLite 驱动</div>
    </div>
  </ZPageBanner>

  <div class="page-fcircle">
    <div class="fcircle">
      <!-- 随机文章区域 -->
      <section class="fcircle__random-article" :class="{ 'is-loading': isLoading && !randomArticle }" :aria-busy="isLoading && !randomArticle">
        <h2 class="fcircle__random-title">随机文章</h2>
        <div class="article-item">
          <a
            v-if="randomArticle"
            :href="randomArticle.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-item__container gradient-card"
          >
            <span class="article-item__author">{{ randomArticle.author }}</span>
            <span class="article-item__title">{{ randomArticle.title }}</span>
            <span class="article-item__date">{{ formatDate(randomArticle.created) }}</span>
          </a>
          <div v-else class="article-item__container article-item__container--placeholder gradient-card" aria-hidden="true">
            <span class="article-item__author skeleton-line skeleton-line--short"></span>
            <span class="article-item__title skeleton-line"></span>
            <span class="article-item__date skeleton-line skeleton-line--tiny"></span>
          </div>
        </div>
        <ZButton
          class="btn-refresh gradient-card"
          @click="refreshRandomArticle"
          icon="uim:process"
          title="换一篇随机文章"
          aria-label="换一篇随机文章"
          :disabled="!allArticles.length"
        />
      </section>

      <!-- 文章列表区域 -->
      <div class="fcircle__articles">
        <template v-if="isLoading">
          <div
            v-for="index in UserConfig.page_size"
            :key="`skeleton-${index}`"
            class="article-item article-item--placeholder"
            aria-hidden="true"
          >
            <div class="article-item__image article-item__image--placeholder" />
            <div class="article-item__container article-item__container--placeholder gradient-card">
              <span class="article-item__author skeleton-line skeleton-line--short"></span>
              <span class="article-item__title skeleton-line"></span>
              <span class="article-item__date skeleton-line skeleton-line--tiny"></span>
            </div>
          </div>
        </template>
        <div
          v-else
          v-for="(article, index) in displayedArticles"
          :key="article.id"
          class="article-item article-item--new"
          :style="{ '--delay': `${(index % UserConfig.page_size) * 0.05}s` }"
        >
          <div class="article-item__image" @click="showAvatarPosts(article.author, article.avatar, article.link)">
            <img
              :src="getOptimizedImageUrl(article.avatar, { width: 64, height: 64, fit: 'cover', quality: 74 })"
              :alt="article.author"
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
            />
          </div>
          <a
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-item__container gradient-card"
          >
            <span class="article-item__author">{{ article.author }}</span>
            <span class="article-item__title">{{ article.title }}</span>
            <span class="article-item__date">{{ formatDate(article.created) }}</span>
          </a>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <ZButton
        v-show="hasMoreArticles"
        class="btn-load-more gradient-card"
        @click="loadMore"
        text="加载更多"
      />

      <!-- 空状态 -->
      <ZError
        v-if="!isLoading && allArticles.length === 0"
        icon="solar:confounded-square-bold-duotone"
        title="内容为空或页面不存在"
        message="暂无文章数据，请稍后再试。"
      />

      <!-- 作者模态框 - 时间线样式 -->
      <Transition name="modal">
        <div
          v-if="showAvatarPopup && selectedAuthor && articlesByAuthor[selectedAuthor]"
          id="avatar-popup"
          class="modal"
          @click="closeAvatarPopup"
        >
          <div class="modal__content" @click.stop>
            <div class="modal__header">
              <NuxtImg
                :src="getOptimizedImageUrl(selectedAuthorAvatar, { width: 128, height: 128, fit: 'cover', quality: 78 })"
                :alt="selectedAuthor"
                loading="lazy"
                decoding="async"
                width="128"
                height="128"
                class="modal__avatar-img"
              />
              <h3>{{ selectedAuthor }}</h3>
              <a
                :href="selectedArticleLink"
                target="_blank"
                rel="noopener noreferrer"
                class="modal__author-link"
              >
                <Icon name="lucide:external-link" />
              </a>
            </div>
            <div class="modal__body">
              <div class="timeline">
                <div
                  v-for="(article, index) in (articlesByAuthor[selectedAuthor] || []).slice(0, 10)"
                  :key="article.id"
                  class="timeline__item"
                  :style="{ '--delay': (0.2 + index * 0.1) + 's' }"
                >
                  <span class="timeline__date">{{ formatDate(article.created) }}</span>
                  <a
                    :href="article.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="timeline__title"
                    @click="closeAvatarPopup"
                  >
                    {{ article.title }}
                  </a>
                </div>
              </div>
            </div>
            <div class="modal__avatar">
              <NuxtImg
                :src="getOptimizedImageUrl(selectedAuthorAvatar, { width: 256, height: 256, fit: 'cover', quality: 72 })"
                :alt="selectedAuthor"
                loading="lazy"
                decoding="async"
                width="256"
                height="256"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 动画定义 */
@keyframes pulse-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slide-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 主要样式 */
.page-fcircle {
  animation: float-in .2s backwards;
  margin: 1rem;
}

.fcircle-stats {
  align-items: flex-end;
  color: #eee;
  display: flex;
  flex-direction: column;
  font-family: var(--font-monospace);
  font-size: .7rem;
  gap: .1rem;
  opacity: .7;
  text-shadow: 0 4px 5px rgba(0,0,0,.5);

  .fcircle-stats__update-time { opacity: 1; }
  .fcircle-stats__powered-by { opacity: .8; }
}

.fcircle {
  .fcircle__random-article {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    min-height: 2.5rem;
    margin: 1rem 0;

    .fcircle__random-title {
      font-size: 1.2rem;
      white-space: nowrap;
    }

    .article-item {
      flex: 1;
      min-width: 0;

      .article-item__container {
        min-width: 0;

        .article-item__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .fcircle__articles {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
}

/* 文章项样式 */
.article-item {
  align-items: center;
  display: flex;
  gap: 10px;
  min-height: 2.5rem;
  width: 100%;

  &.article-item--new { animation: float-in .2s var(--delay) backwards; }
  &.article-item--placeholder { animation: none; }

  .article-item__image {
    border-radius: 50%;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    flex-shrink: 0;
    height: 2rem;
    overflow: hidden;
    width: 2rem;

    img {
      height: 100%;
      object-fit: cover;
      opacity: .8;
      transition: all .2s;
      width: 100%;
    }

    &.article-item__image--placeholder {
      background: linear-gradient(90deg, var(--c-bg-soft), var(--c-bg-2), var(--c-bg-soft));
      background-size: 200% 100%;
      box-shadow: none;
      animation: pulse-fade 1.2s ease-in-out infinite;
    }
  }

  .article-item__container {
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    gap: 5px;
    height: 2.5rem;
    overflow: hidden;
    padding: 10px;
    width: 100%;

    &.article-item__container--placeholder {
      box-shadow: 0 0 0 1px var(--c-bg-soft);
    }

    &:hover .article-item__title { color: var(--c-text); }

    .article-item__author {
      color: var(--c-text-3);
      font-size: .85rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .article-item__title {
      color: var(--c-text-2);
      flex: 1;
      font-size: .9375rem;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color .2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
    }

    .article-item__date {
      color: var(--c-text-3);
      font-family: var(--font-monospace);
      font-size: .75rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
  }
}

.skeleton-line {
  display: block;
  height: .8rem;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--c-bg-soft), var(--c-bg-2), var(--c-bg-soft));
  background-size: 200% 100%;
  animation: pulse-fade 1.2s ease-in-out infinite;

  &.skeleton-line--short { width: 4.5rem; }
  &.skeleton-line--tiny { width: 3.25rem; }
}

/* 按钮样式 */
.btn-refresh {
  align-items: center;
  background-color: unset;
  border-radius: 8px;
  color: var(--c-text-2);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 2.5rem;
  justify-content: center;
  transition: all .2s ease;
  width: 2.5rem;
  box-shadow: none;

  &:hover {
    background-color: unset;
  }
}

.btn-load-more {
  background-color: var(--ld-bg-card);
  border-radius: 8px;
  box-shadow: .1em .2em .5rem var(--ld-shadow);
  display: block;
  font-size: .875rem;
  height: 42px;
  margin: 1rem auto;
  padding: .75rem;
  width: 200px;

  &:hover { color: var(--c-text); }
}

/* 模态框样式 */
.modal {
  align-items: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  position: fixed;
  z-index: 100;

  .modal__content {
    background-color: var(--c-bg-a50);
    border-radius: 12px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    max-height: 80vh;
    max-width: 500px;
    overflow-y: auto;
    padding: 1.25rem;
    position: relative;
    width: 90%;

    .modal__header {
      align-items: center;
      border-bottom: 1px solid var(--c-bg-soft);
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;

      img { border-radius: 50%; height: 50px; object-fit: cover; width: 50px; }
      h3 { flex: 1; font-size: 1.2rem; margin: 0; }

      .modal__author-link {
        border-radius: 8px;
        color: var(--c-text-2);
        padding: 8px;
        transition: all .3s;

        &:hover { background: var(--c-bg-soft); color: var(--c-text); }
      }
    }

    .modal__body {
      .timeline {
        position: relative;

        &:after {
          background-color: var(--c-bg-soft);
          bottom: 0;
          content: "";
          left: .25rem;
          position: absolute;
          top: .5rem;
          transform: translate(-50%);
          width: 2px;
        }

        .timeline__item {
          animation: float-in .3s var(--delay) backwards;
          color: var(--c-text-2);
          padding: 0 0 1rem 1.25rem;
          position: relative;

          &:before {
            background-color: var(--c-text-2);
            border-radius: 50%;
            content: "";
            height: .5rem;
            left: .25rem;
            position: absolute;
            top: .5rem;
            transform: translateY(-50%) translate(-50%);
            transition: transform .3s ease, box-shadow .3s ease;
            width: .5rem;
            z-index: 1;
          }

          &:hover:before {
            box-shadow: 0 0 8px var(--c-text-2);
            transform: translateY(-50%) translate(-50%) scale(1.5);
          }

          .timeline__date {
            color: var(--c-text-3);
            display: block;
            font-family: var(--font-monospace);
            font-size: .875rem;
            margin-bottom: .3rem;
          }

          .timeline__title {
            color: var(--c-text-2);
            line-height: 1.4;
            transition: color .3s;

            &:hover { color: var(--c-text); }
          }
        }
      }
    }

    .modal__avatar {
      border-radius: 50%;
      bottom: 1.25rem;
      filter: blur(5px);
      height: 128px;
      opacity: .6;
      overflow: hidden;
      pointer-events: none;
      position: absolute;
      right: 1.25rem;
      width: 128px;
      z-index: 1;

      img { height: 100%; object-fit: cover; width: 100%; }
    }
  }
}

/* 模态框过渡 */
.modal-enter-active,
.modal-enter-active .modal__content,
.modal-leave-active,
.modal-leave-active .modal__content {
  transition: all .3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__content,
.modal-leave-to .modal__content {
  transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .modal__content,
.modal-leave-from .modal__content {
  transform: translateY(0);
}

/* 错误容器 */
.error-container {
  align-items: center;
  color: var(--c-text-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 400px;
  justify-content: center;

  .error-container__icon { font-size: 4rem; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fcircle__random-article .fcircle__random-title { display: none; }

  .page-fcircle .article-item .article-item__container {
    flex-wrap: wrap;
    height: auto;
  }

  .page-fcircle .article-item .article-item__container .article-item__author {
    flex-grow: 1;
  }

  .page-fcircle .article-item .article-item__container .article-item__title {
    flex-basis: 100%;
    order: 3;
    white-space: normal;
  }
}
</style>
