import type { EssayItem } from '~/types/essay'

const essays: EssayItem[] = [
	{
		text: '今日消费 555 😭😭😭',
		date: '2026-08-16T19:10',
		tags: ['生活'],
	},
	{
		text: '小猫吃饭吧唧嘴是因为小猫有嘴努子，小狗吃饭吧唧嘴是因为小狗有嘴筒子，而人吃饭吧唧嘴是因为人想吃嘴巴子',
		date: '2026-08-12T18:19',
		tags: ['生活', '想法'],
	},
	{
		text: '看到这样一句话：如果你看不惯一个人，就在心里默念 “你算蛋！” 三次，千万别说出来，这样你就会变的很自信！！！',
		date: '2026-08-12T16:44',
		tags: ['生活', '想法'],
	},
	{
		text: '宋冬野竟然发布了新专辑？',
		date: '2026-07-02T12:33',
		linkCards: [
			{
				link: 'https://music.163.com/album?id=384720819&uct2=U2FsdGVkX1+b8dnPszziQRYUzTR81JV8WLWeHor8T2M=',
				title: '再想想 宋冬野 2026-06-29',
				description: '《再想想》有如浓茶烈酒，尽蓄生命中的千般滋味，如此丰盈，诱惑着你，去一遍遍地再听听，再想想......',
				icon: 'https://p1.music.126.net/7RoHUwChyO-K0R5QwJV_GA==/109951173491710736.jpg?param=177y177',
			},
		],
		tags: ['生活'],
	},
	{
		text: '第一次追完一部动画片 -- 神奇数字马戏团',
		date: '2026-06-26T11:57',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/essay_digital_circus_1786705674.webp',
				alt: 'The Amazing Digital Circus',
				height: 240,
			},
		],
		tags: ['生活', '分享'],
	},
	{
		text: '让我们嘲笑他',
		date: '2026-06-18T13:36',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/essay_earphone_cable_1786705674.webp',
				alt: '耳机充电线？',
				height: 240,
			},
		],
		tags: ['生活', '分享'],
	},
	{
		text: '我竟然也被 DeepSeek 抽中识图模式内测了',
		date: '2026-06-18T13:03',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/essay_deepseek_vision_1786705674.webp',
				alt: 'DeepSeek 识图模式',
				height: 240,
			},
		],
		tags: ['分享'],
	},
	{
		text: '折腾几天，做了个自己形象的设定图，并挂在了关于页',
		date: '2026-06-02T21:06',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/kayro_character_1786705675.webp',
				alt: '敖苛设定图',
				height: 240,
			},
		],
		tags: ['分享'],
	},
	{
		text: 'AI时代，是幸运还是不幸？',
		date: '2026-04-29T22:50',
		tags: ['想法'],
	},
	{
		text: '在评论区添加了我自己的表情包',
		date: '2026-04-20T16:57',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/essay_linxiaotian_emoticon_1786705675.webp',
				alt: '林小天',
				height: 240,
			},
		],
		tags: ['网站'],
	},
	{
		text: '有个服务器闲着，部署个 Hermes Agent 玩玩',
		date: '2026-04-20T13:48',
		images: [
			{
				src: 'https://assets.kayro.cn/blog/essay_hermes_agent_1786705675.webp',
				alt: 'ai竟然教育我',
				height: 240,
			},
		],
		tags: ['分享', '技术'],
	},
	{
		text: '折腾的终点是默认',
		date: '2026-04-11T22:38',
		tags: ['网站'],
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
				src: 'https://assets.kayro.cn/blog/essay_shouxin_ime_1786705675.webp',
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
				src: 'https://assets.kayro.cn/blog/essay_lantern_festival_1786705676.webp',
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
