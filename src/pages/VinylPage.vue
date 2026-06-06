<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import VinylDetails from '../components/VinylDetails.vue';
import AddVinylModal from '../components/AddVinylModal.vue';
import * as service from '../services/vinyls';
import type { Vinyl } from '../types';

const router = useRouter();
const route = useRoute();
const vinylId = route.params.id as string;

const vinyl = ref<Vinyl>();
const loading = ref(false);
const showEditModal = ref(false);

const fetchVinyl = async (id: string) => {
  loading.value = true;
  try {
    vinyl.value = await service.getVinyl(id);
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
}
watch(() => vinylId, fetchVinyl);
onMounted(() => fetchVinyl(vinylId));

const favoriteVinyl = async () => {
  if (!vinyl.value) return;

  try {
    await service.favoriteVinyl(vinylId, !vinyl.value.favorite)
    vinyl.value.favorite = !vinyl.value?.favorite;
  } catch (e) {
    console.log(e);
  }
}

const updateVinyl = async (data: Vinyl) => {
  try {
    vinyl.value = await service.updateVinyl(vinylId, data);
  } catch (e) {
    console.log(e);
  }
}

const deleteVinyl = async () => {
  if (confirm('Are you sure you want to delete this vinyl from your catalog?')) {
    try {
      await service.deleteVinyl(vinylId);
      router.push('/catalog');
    } catch(e : any) {
      alert(e.response.data);
    }
  }
}

const playVinyl = async () => {
  if (!vinyl.value) return;
  const sides = Array.from({ length: vinyl.value.nSides }, (_, i) => i + 1);
  try {
    await service.playVinyl(vinylId, { sides });
    router.push('/');
  } catch (e) {
    console.log(e);
  }
}

</script>

<template>
  <AddVinylModal v-if="showEditModal && vinyl" @close="showEditModal = false" :selected-vinyl="vinyl" @save-vinyl="updateVinyl" />
  <div v-if="loading" class="loading">Loading...</div>
  <VinylDetails v-if="vinyl" :vinyl="vinyl" :on-play="playVinyl" />
  <div v-if="vinyl" class="buttons">
    <button class="icon-button" @click="favoriteVinyl()">
      <img v-if="vinyl?.favorite" class="icon" src="../assets/icons/heart-filled.png" />
      <img v-else class="icon" src="../assets/icons/heart.png" />
    </button>
    <button class="icon-button" @click="showEditModal = true">
      <img class="icon" src="../assets/icons/edit.png" />
    </button>
    <button class="icon-button" @click="deleteVinyl()">
      <img class="icon" src="../assets/icons/delete.png" />
    </button>
  </div>
</template>

<style scoped>
  .loading {
    padding: 32px 0;
    text-align: center;
    color: hsl(33, 25%, 62%);
  }

  .buttons {
    margin-bottom: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
</style>
