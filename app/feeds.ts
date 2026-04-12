import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Dalao
	{
		name: '膜拜',
		desc: '网络上遇到的大佬',
		// @keep-sorted { "keys": ["date"] }
		entries: [

			{
				author: '张洪Heo',
				desc: '分享设计与科技生活',
				link: 'https://blog.zhheo.com/',
				feed: 'https://blog.zhheo.com/atom.xml',
				icon: 'https://blog.zhheo.com/img/favicon4.0.webp',
				avatar: 'https://img.zhheo.com/i/67d8fa75943e4.webp',
				archs: ['Hexo', '国内 CDN'],
				date: '2024-03-05',
				comment: '知名博主，其博客设计风格被众多人借鉴。',
			},
			{
				author: '纸鹿',
				sitenick: '摸鱼处',
				title: '纸鹿摸鱼处',
				desc: '分享设计与科技生活纸鹿至麓不知路，支炉制露不止漉',
				link: 'https://blog.zhilu.site/',
				feed: 'https://blog.zhilu.site/atom.xml',
				icon: 'https://www.zhilu.site/icon.png',
				avatar: getGithubAvatar('L33Z22L11'),
				archs: ['Nuxt', 'Vercel'],
				date: '2026-03-05',
				comment: 'Clarity 主题作者',
			},
			{
				author: '杜老师',
				title: '杜老师说',
				desc: '师者，传道，授业，解惑！',
				link: 'https://dusays.com/',
				feed: 'https://dusays.com/atom.xml',
				icon: 'https://cdn.dusays.com/favicon.ico',
				avatar: 'https://cdn.sep.cc/avatar/28b57baa4e8f13fe4292ccb2de267e30?s=150&d=mm&r=g',
				archs: ['Hexo', '服务器'],
				date: '2026-03-05',
			},
			{
				author: '無名',
				sitenick: '小栈',
				title: '無名小栈',
				desc: '分享技术与科技生活',
				link: 'https://blog.imsyy.top/',
				feed: 'https://blog.imsyy.top/rss.xml',
				icon: getFavicon('blog.imsyy.top'),
				avatar: getGithubAvatar('imsyy'),
				archs: ['VitePress', 'Vercel'],
				date: '2026-03-05',
			},
			{
				author: '柳神',
				title: '清羽飞扬',
				desc: '柳影曳曳，清酒孤灯，扬笔撒墨，心境如霜',
				link: 'https://blog.liushen.fun/',
				feed: 'https://blog.liushen.fun/atom.xml',
				icon: 'https://blog.liushen.fun/info/avatar.ico',
				avatar: 'https://p.liiiu.cn/i/2025/03/13/67d2fc82d329c.webp',
				archs: ['Hexo', '国内 CDN'],
				date: '2026-03-05',
			},
			{
				author: '静かな森',
				desc: '致虚极，守静笃。',
				link: 'https://innei.in/',
				feed: 'https://innei.in/feed',
				icon: 'https://innei.in/innei.svg',
				avatar: getGithubAvatar('Innei'),
				archs: ['Next.js', 'Cloudflare'],
				date: '2026-03-05',
			},
		],
	},
	// #endregion
] satisfies FeedGroup[]
