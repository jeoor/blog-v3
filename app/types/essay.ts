export interface EssayImageObject {
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
}

export interface EssayVideo {
	type?: 'raw' | 'bilibili' | 'bilibili-nano' | 'youtube' | 'douyin' | 'douyin-wide' | 'tiktok'
	id: string
	ratio?: string | number
	poster?: string
}

export type EssayImage = string | EssayImageObject

export interface EssayItem {
	text?: string
	date: string
	images?: EssayImage[]
	linkCards?: EssayLinkCard[]
	video?: EssayVideo
	tags?: string[]
}
