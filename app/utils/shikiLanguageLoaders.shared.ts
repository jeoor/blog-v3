type ShikiLanguageLoader = () => Promise<unknown>

let bundledLanguagesPromise: Promise<Record<string, ShikiLanguageLoader>> | undefined

async function getBundledLanguages() {
	bundledLanguagesPromise ??= import('shiki/langs')
		.then(module => module.bundledLanguages as Record<string, ShikiLanguageLoader>)

	return bundledLanguagesPromise
}

export async function getShikiLanguageLoader(language: string) {
	const bundledLanguages = await getBundledLanguages()
	return bundledLanguages[language]
}
