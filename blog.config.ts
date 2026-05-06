import type { FeedEntry } from './app/types/feed'

const basicConfig = {
	title: '敖苛记',
	subtitle: '敖致天·苛制人',
	// 长 description 利好于 SEO
	description: '敖苛记是敖苛的个人博客，始终秉持“生活不息，折腾不止”的记录方式，专注分享技术折腾、开源探索与日常生活中的真实经历。博客内容持续覆盖编程学习、项目实践、效率提升与个人成长等方向，包括编程语言与框架的学习笔记、实际开发中的踩坑记录与解决思路、实用工具与工作流推荐，以及技术之外的生活思考。这里既有扎实的技术干货，也保留轻松与温度，希望能为来访的朋友提供实用经验、带来启发灵感，同时收获一点简单的快乐。',
	author: {
		name: '敖苛',
		avatar: 'https://blog.kayro.cn/avatar.webp',
		email: 'i@kayro.cn',
		homepage: 'https://www.kayro.cn/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: '/favicon.svg',
	language: 'zh-CN',
	timeEstablished: '2026-02-13',
	timeZone: 'Asia/Shanghai',
	url: 'https://blog.kayro.cn/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'tabler:circle-dashed' },
			/** 实践可复用操作经验：工具/系统/部署/排障 */
			技术: { icon: 'tabler:mouse', color: '#33aaff' },
			/** 编程：代码实现/工程实践/开发方法 */
			开发: { icon: 'tabler:code', color: '#7777ff' },
			/** 学习笔记：课程/书籍/资料的学习总结 */
			笔记: { icon: 'tabler:book', color: '#77bb77' },
			/** 安全：漏洞/CTF/恶意软件/安全事件分析 */
			安全: { icon: 'tabler:bug', color: '#ff7733' },
			/** 思考：观点讨论/复盘反思/行业或产品观察 */
			杂谈: { icon: 'tabler:message', color: '#33bbaa' },
			/** 记录叙事：个人经历/校园家庭/日常片段 */
			生活: { icon: 'tabler:leaf', color: '#ff7777' },
		},
		/** 文章版式，首个为默认版式 */
		types: {
			tech: {},
			story: {},
		},
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
		/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
		useRandomPremalink: true,
		/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
		hidePostPrefix: true,
		/** 禁止搜索引擎收录的路径 */
		robotsNotIndex: ['/preview', '/previews/*'],
	},

	/** 打赏配置 */
	donation: {
		enable: true,
		items: {
			微信: 'https://bu.dusays.com/2026/02/27/69a0bba66a702.webp',
			支付宝: 'https://bu.dusays.com/2026/02/27/69a0bba5bae92.webp',
		},
		message: '感谢您的支持 ♥️',
	},

	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/** 订阅源是否启用XSLT样式 */
		enableStyle: true,
	},

	/** 向 <head> 中添加脚本 */
	scripts: [
		// 自己部署的 Umami 统计服务
		{ 'src': 'https://umami.kayro.cn/script.js', 'data-website-id': '4440adbb-bae6-444c-9cc4-443e490567a1', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		// { 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "97a4fe32ed8240ac8284e9bffaf03962"}', 'defer': true },
		// Twikoo 评论系统
		{ src: 'https://registry.npmmirror.com/twikoo/latest/files/dist/twikoo.min.js', defer: true },
	],

	/** 自己部署的 Twikoo 服务 */
	twikoo: {
		envId: 'https://twikoo.kayro.cn/',
		preload: 'https://twikoo.kayro.cn/',
	},
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: '敖苛记',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'EdgeOne'],
	date: blogConfig.timeEstablished,
	comment: '这个好像是我',
}

export default blogConfig
