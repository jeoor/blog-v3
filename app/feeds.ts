// 友链检测 CLI 需要使用显式导入和相对路径
import type { FeedGroup } from '../app/types/feed'
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Clarity
	// {
	// 	name: '清晰体验',
	// 	desc: '使用 Clarity 博客主题构建的网站。',
	// 	// @keep-sorted { "keys": ["date"] }
	// 	entries: [
	// 		myFeed,
	// 		{
	// 			author: 'Xlenco',
	// 			sitenick: '希乐博客',
	// 			desc: '互联网中的静谧之地',
	// 			link: 'https://blog.xlenco.top/',
	// 			feed: 'https://blog.xlenco.top/atom.xml',
	// 			icon: 'https://weavatar.com/avatar/67254b346498965226e5c91ebff66a69570b97f224d2d061e504b4eade1f00fa',
	// 			avatar: getOicqAvatar('1043865083'),
	// 			archs: ['Nuxt', 'EdgeOne'],
	// 			date: '2024-07-28',
	// 			comment: '学生，经验分享。',
	// 		},
	// 		{
	// 			author: '唤青',
	// 			sitenick: 'Abloom',
	// 			title: '唤青映记',
	// 			desc: 'Per aspera ad astra',
	// 			link: 'https://eees.blog/',
	// 			feed: 'https://eees.blog/atom.xml',
	// 			icon: getGithubIcon('abloom25'),
	// 			avatar: getGithubAvatar('abloom25'),
	// 			archs: ['Nuxt', 'Cloudflare'],
	// 			date: '2024-12-09',
	// 			comment: '高中生，技术学习中。',
	// 		},
	// 	],
	// },
	// #endregion
] satisfies FeedGroup[]
