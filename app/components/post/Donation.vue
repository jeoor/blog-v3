<script setup lang="ts">
const { donation } = useAppConfig()
const donationOpen = ref(false)
</script>

<template>
<div v-if="donation?.enable" class="donation">
	<ZButton
		class="donate-button"
		icon="ph:heart-bold"
		:aria-expanded="donationOpen"
		aria-controls="donation-panel"
		@click="donationOpen = !donationOpen"
	>
		赞赏作者
	</ZButton>

	<div v-if="donationOpen" id="donation-panel" class="donation-content">
		<div v-if="Object.keys(donation.items).length" class="donation-list">
			<figure v-for="(image, label) in donation.items" :key="label" class="donation-item">
				<UtilImg class="image" width="160" height="160" :src="image" />
				<figcaption class="label">
					{{ label }}
				</figcaption>
			</figure>
		</div>
		<p v-else class="donation-message">
			暂未配置收款码
		</p>
		<p v-if="donation.message" class="donation-message">
			{{ donation.message }}
		</p>
	</div>
</div>
</template>

<style lang="scss" scoped>
.donation {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;

	.donate-button {
		padding: 0.6rem 0.8rem;
		border: 1px solid var(--c-border);
		box-shadow: none;
	}

	.donation-content {
		width: min(100%, 32rem);
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--c-border);
		border-radius: 1rem;
		box-shadow: var(--box-shadow-1);
		background-color: var(--c-bg-2);
		text-align: center;

		.donation-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 1.5rem;
			padding: 0.5rem 0;
		}

		.donation-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;

			.image {
				border-radius: 0.5rem;
			}

			.label {
				color: var(--c-text-2);
			}
		}

		.donation-message {
			color: var(--c-text-1);
		}
	}
}
</style>
