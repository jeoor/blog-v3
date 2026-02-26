export interface AlbumImage {
	url: string
	title: string
	description?: string
	date?: string
}

export interface AlbumFolder {
	id: string
	name: string
	cover?: string
	images: AlbumImage[]
	createdAt?: string
	custom?: boolean
}
