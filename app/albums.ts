import type { AlbumFolder } from '~/types/album'

const albums: AlbumFolder[] = [
	{
		id: 'daily-life',
		name: '日常记录',
		cover: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
		images: [
			{
				title: '午后咖啡',
				url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
				description: '周末的慢节奏。',
				date: '2026-02-10',
			},
			{
				title: '城市街角',
				url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80',
				description: '傍晚散步随拍。',
				date: '2026-02-12',
			},
			{
				title: '雨后光影',
				url: 'https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?auto=format&fit=crop&w=1400&q=80',
				description: '路面反射很好看。',
				date: '2026-02-18',
			},
		],
	},
	{
		id: 'travel-memory',
		name: '旅行碎片',
		cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
		images: [
			{
				title: '海岸线',
				url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1400&q=80',
				description: '风很大，天很蓝。',
				date: '2026-01-23',
			},
			{
				title: '山路',
				url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
				description: '一路向上。',
				date: '2026-01-24',
			},
			{
				title: '夜色',
				url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80',
				description: '城市夜景。',
				date: '2026-01-25',
			},
		],
	},
	{
		id: 'workspace',
		name: '桌面与设备',
		cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
		images: [
			{
				title: '开发环境',
				url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
				description: '把桌面重新收纳了一下。',
				date: '2026-02-03',
			},
			{
				title: '键盘细节',
				url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=80',
				description: '手感很舒服。',
				date: '2026-02-05',
			},
			{
				title: '夜间工作流',
				url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
				description: '夜深了，继续写点代码。',
				date: '2026-02-09',
			},
		],
	},
]

export default albums
