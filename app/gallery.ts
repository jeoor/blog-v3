import type { GalleryFolder, GalleryImage } from '~/types/gallery'

const galleryBase: Omit<GalleryFolder, 'cover'>[] = [
	{
		id: 'flowers',
		name: '花',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a03149c7c.webp',
			'https://bu.dusays.com/2026/03/05/69a9a0343a573.webp',
			'https://bu.dusays.com/2026/03/05/69a9a03372f11.webp',
			'https://bu.dusays.com/2026/03/05/69a9a032cb5c1.webp',
			'https://bu.dusays.com/2026/03/05/69a9a032013ec.webp',
		],
	},
	{
		id: 'sea',
		name: '湖海',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a30d0817a.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30c61430.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30bbf7e8.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30b11eb9.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30a6b453.webp',
			'https://bu.dusays.com/2026/03/05/69a9a309ae10e.webp',
			'https://bu.dusays.com/2026/03/05/69a9a309115bc.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30869cf8.webp',
			'https://bu.dusays.com/2026/03/05/69a9a307bfea1.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3072088e.webp',
			'https://bu.dusays.com/2026/03/05/69a9a30673618.webp',
			'https://bu.dusays.com/2026/03/05/69a9a305cbc50.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3052bf5d.webp',
		],
	},
	{
		id: 'sky',
		name: '天地',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a395224ef.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3948626f.webp',
			'https://bu.dusays.com/2026/03/05/69a9a393e95e8.webp',
			'https://bu.dusays.com/2026/03/05/69a9a39360e0a.webp',
			'https://bu.dusays.com/2026/03/05/69a9a392c7244.webp',
			'https://bu.dusays.com/2026/03/05/69a9a392357a6.webp',
			'https://bu.dusays.com/2026/03/05/69a9a39198c7f.webp',
			'https://bu.dusays.com/2026/03/05/69a9a391074c5.webp',
			'https://bu.dusays.com/2026/03/05/69a9a39070537.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38fca8db.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38f32ce2.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38e85258.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38ddb1c5.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38d4783f.webp',
			'https://bu.dusays.com/2026/03/05/69a9a38c98fbe.webp',
		],
	},
	{
		id: 'airplane',
		name: '飞机上',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a3e3649e2.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3e2bf553.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3e21bacd.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3e17022c.webp',
			'https://bu.dusays.com/2026/03/05/69a9a3e0cb223.webp',
		],
	},
	{
		id: 'sun',
		name: '日月',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a45f9418e.webp',
			'https://bu.dusays.com/2026/03/05/69a9a45ef3ef6.webp',
			'https://bu.dusays.com/2026/03/05/69a9a45e4fc38.webp',
			'https://bu.dusays.com/2026/03/05/69a9a45da4b17.webp',
		],
	},
	{
		id: 'animals',
		name: '动物（标本）',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a4acd530b.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4ac302a5.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4ab86c27.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4aadc29e.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4aa444f9.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a992fa3.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a8f3fea.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a86303a.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a7b18b5.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a70e233.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a655aef.webp',
			'https://bu.dusays.com/2026/03/05/69a9a4a599238.webp',
		],
	},
	{
		id: 'museum',
		name: '博物馆',
		images: [
			'https://bu.dusays.com/2026/03/05/69a9a51e1fe96.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51d7cfae.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51cc9d3d.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51c370ea.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51b9fcae.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51b0358d.webp',
			'https://bu.dusays.com/2026/03/05/69a9a51a6e54f.webp',
			'https://bu.dusays.com/2026/03/05/69a9a519c1ff6.webp',
			'https://bu.dusays.com/2026/03/05/69a9a5191a453.webp',
		],
	},
]

function getImageUrl(image?: GalleryImage) {
	if (!image)
		return undefined
	return typeof image === 'string' ? image : image.url
}

function pickRandomImage(images: GalleryImage[]) {
	if (!images.length)
		return undefined
	const index = Math.floor(Math.random() * images.length)
	return getImageUrl(images[index])
}

const gallery: GalleryFolder[] = galleryBase.map(folder => ({
	...folder,
	cover: pickRandomImage(folder.images),
}))

export default gallery
