import type { Nav, NavItem } from '~/types/nav'
import { pascalCase } from 'es-toolkit/string'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'
import { name, version } from '~~/package.json'

// 图标查询：https://yesicon.app/ph?s=bold
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	component: {
		alert: {
			/** 默认使用卡片风格还是扁平风格 */
			defaultStyle: 'card' as 'card' | 'flat',
		},

		codeblock: {
			/** 代码块触发折叠的行数 */
			triggerRows: 32,
			/** 代码块折叠后的行数 */
			collapsedRows: 16,
			/** 启用代码块缩进导航会关闭空格渲染 */
			enableIndentGuide: true,
			/** 代码块缩进导航(Indent Guige)竖线匹配空格数 */
			indent: 4,
			/** tab渲染宽度 */
			tabSize: 3,
		},

		/** 文章开头摘要 */
		excerpt: {
			animation: true,
			caret: '_',
		},

		/** 精选文章 Slide */
		slide: {
			/** 适合封面图无字时启用 */
			showTitle: true,
		},

		stats: {
			/** 归档页面每年标题对应的年龄 */
			birthYear: 2007,
			/** blog-stats widget 的预置文本 */
			wordCount: '约10万',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${Temporal.Now.plainDateISO().year.toString()} ${blogConfig.author.name}`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'tabler:home', text: '个人主页', url: blogConfig.author.homepage },
			{ icon: 'tabler:brand-bilibili', text: '哔哩哔哩: 敖苛', url: 'https://space.bilibili.com/513671572' },
			{ icon: 'tabler:brand-github', text: 'GitHub: jeoor', url: 'https://github.com/jeoor' },
			{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
			{ icon: 'tabler:mail', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
		],

		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
					{ icon: 'tabler:sitemap', text: '站点地图', url: '/sitemap.xml' },
					{ icon: 'tabler:planet', text: '异次元之旅', url: 'https://travel.moe/go.html?travel=on' },
				],
			},
			{
				title: '主题',
				items: [
					{ icon: 'tabler:brand-nuxt', text: `${pascalCase(name)} ${version}`, url: 'https://github.com/L33Z22L11/blog-v3' },
					{ icon: 'zi:zhilu', text: '纸鹿大佬博客', url: 'https://blog.zhilu.site/' },
					{ icon: 'tabler:palette', text: '主题和组件文档', url: 'https://blog.zhilu.site/theme' },
				],
			},
			{
				title: '备案',
				items: [
					{ icon: 'tabler:certificate', text: '冀ICP备2026002497号-1', url: 'https://beian.miit.gov.cn/' },
					{ icon: 'tabler:shield', text: '冀公网安备13112502001042号', url: 'https://beian.mps.gov.cn/#/query/webSearch?code=13112502001042' },
					{ icon: 'tabler:shield-heart', text: '萌ICP备20261311号', url: 'https://icp.gov.moe/?keyword=20261311' },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: blogConfig.author.avatar,
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		subtitle: blogConfig.subtitle,
		emojiTail: ['☁️', '🌈', '☀️', '❄️', '🪁'],
	},

	/** 友链页面 */
	link: {
		/** 无订阅源展示静音图标 */
		remindNoFeed: true,
		/** 友链分组内随机排序 */
		randomInGroup: true,
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'tabler:files', text: '文章', url: '/' },
				{ icon: 'tabler:archive', text: '归档', url: '/archive' },
				{ icon: 'tabler:tag', text: '标签', url: '/tags' },
				{ icon: 'tabler:pencil', text: '即刻', url: '/essay' },
				{ icon: 'tabler:photo', text: '相册', url: '/gallery' },
				{ icon: 'tabler:brand-spacehey', text: '友圈', url: '/fcircle' },
				{ icon: 'tabler:link', text: '友链', url: '/link' },
				{ icon: 'tabler:user', text: '关于', url: '/about' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as keyof typeof blogConfig.article.order,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	themes: {
		light: {
			icon: 'tabler:sun',
			tip: '浅色模式',
		},
		system: {
			icon: 'tabler:device-desktop',
			tip: '跟随系统',
		},
		dark: {
			icon: 'tabler:moon',
			tip: '深色模式',
		},
	},
})
