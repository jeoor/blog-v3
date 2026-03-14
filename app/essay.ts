import type { EssayItem } from '~/types/essay'

export default [
	{
		text: '你附近有人手机打字使用双键双拼吗？',
		date: '2026-03-04 11:55',
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
		date: '2026-03-03 22:30',
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
		date: '2026-03-01 22:00',
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
	// {
	//   text: '这是一个同时包含<b>视频</b>和<b>图片</b>的示例。<br>支持多种媒体格式的展示。',
	//   date: '1885-07-22 20:00',
	//   images: [
	//     'https://bu.dusays.com/2025/09/05/68ba9c061a069.webp',
	//     'https://bu.dusays.com/2025/09/05/68ba9cc68cbe0.webp',
	//     'https://bu.dusays.com/2025/09/05/68ba9cc68cbe0.webp',
	//   ],
	//   video: {
	//     type: 'bilibili',
	//     id: 'BV1xx411c7mD',
	//   },
	//   tags: ['旅行'],
	// },
] satisfies EssayItem[]
