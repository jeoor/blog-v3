import type { ImgService } from '~/utils/img'

export type EssayImage = string | {
	src: string
	alt?: string
	width?: string | number
	height?: string | number
}

export interface EssayLinkCard {
	link: string
	title: string
	description?: string
	icon?: string
	mirror?: ImgService
}

export interface EssayItem {
	text?: string
	date: string
	images?: EssayImage[]
	linkCards?: EssayLinkCard[]
	video?: {
		type?: 'raw' | 'bilibili' | 'bilibili-nano' | 'youtube' | 'douyin' | 'douyin-wide' | 'tiktok'
		id: string
		ratio?: string | number
		poster?: string
	}
	tags?: string[]
}
