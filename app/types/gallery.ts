export interface GalleryImage {
	url: string
	title: string
}

export interface GalleryFolder {
	id: string
	name: string
	cover?: string
	images: GalleryImage[]
	createdAt?: string
	custom?: boolean
}
