<script setup lang="ts">
const { donation } = useAppConfig()
const donationOpen = ref(false)
</script>

<template>
<div class="donation" v-if="donation?.enable">
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
    <div class="donation-list" v-if="Object.keys(donation.items).length">
      <figure class="donation-item" v-for="(image, label) in donation.items">
        <UtilImg class="image" width="160" height="160" :src="image" />
        <figcaption class="label">{{ label }}</figcaption>
      </figure>
    </div>
    <p class="donation-message" v-else>暂未配置收款码</p>
    <p class="donation-message" v-if="donation.message">{{ donation.message }}</p>
  </div>
</div>
</template>

<style lang="scss" scoped>
.donation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;

  .donate-button {
    padding: .6rem .8rem;
    border: 1px solid var(--c-border);
    box-shadow: none;
  }

  .donation-content {
    width: min(100%, 32rem);
    text-align: center;
    padding: .5rem .6rem;
    border: 1px solid var(--c-border);
    border-radius: 1rem;
    background-color: var(--c-bg-2);
    box-shadow: var(--box-shadow-1);

    .donation-list {
      display: flex;
      padding: .5rem 0;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .donation-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;

      .image {
        border-radius: .5rem;
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
