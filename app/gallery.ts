import type { GalleryFolder } from '~/types/gallery'

const gallery: GalleryFolder[] = [
	{
		id: 'daily-life',
		name: '日常记录',
		cover: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
		images: [
			{
				title: '午后咖啡',
				url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
			},
			{
				title: '城市街角',
				url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80',
			},
			{
				title: '雨后光影',
				url: 'https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?auto=format&fit=crop&w=1400&q=80',
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
			},
			{
				title: '山路',
				url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
			},
			{
				title: '夜色',
				url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80',
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
			},
			{
				title: '键盘细节',
				url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=80',
			},
			{
				title: '夜间工作流',
				url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
			},
		],
	},
]

export default gallery
