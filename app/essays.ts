import type { EssayItem } from '~/types/essay'

const essays: EssayItem[] = [
	{
		text: "在评论区添加我我自己的表情包",
		date: '2026-04-20T16:57',
		images: [
			{
				src: "https://bu.dusays.com/2026/04/20/69e5ead38bb09.webp",
				alt: "林小天",
				height: 240,
			},
		],
		tags: ["网站"],
	},
	{
		text: "有个服务器闲着，部署个 Hermes Agent 玩玩",
		date: '2026-04-20T13:48',
		images: [
			{
				src: "https://bu.dusays.com/2026/04/20/69e5bdef1f3b9.webp",
				alt: "ai竟然教育我",
				height: 240,
			},
		],
		tags: ["分享"],
	},
	{
		text: "折腾的终点是默认",
		date: '2026-04-11T22:38',
		tags: ["网站"],
	},
	{
		text: '换个字体',
		date: '2026-04-04T18:28',
		tags: ['网站'],
	},
	{
		text: '你附近有人手机打字使用双键双拼吗？',
		date: '2026-03-04T11:55',
		images: [
			{
				src: 'https://bu.dusays.com/2026/03/04/69a7ae3bc2927.webp',
				alt: '手心输入法',
				height: 240,
			},
		],
		tags: ['生活'],
	},
	{
		text: '元宵节快乐！',
		date: '2026-03-03T22:30',
		images: [
			{
				src: 'https://bu.dusays.com/2026/03/04/69a7ad5084b96.webp',
				alt: '元宵节快乐！',
				height: 240,
			},
		],
		tags: ['生活'],
	},
	{
		text: '发现了 Clarity 这个主题，后面就用这个主题写文章了。',
		date: '2026-03-01T22:00',
		linkCards: [
			{
				link: 'https://github.com/L33Z22L11/blog-v3',
				title: 'Clarity 主题仓库',
				description: '基于 Nuxt + Content 的个人博客主题',
				icon: 'https://www.zhilu.site/icon.png',
			},
		],
		tags: ['网站'],
	},
]

export default essays
