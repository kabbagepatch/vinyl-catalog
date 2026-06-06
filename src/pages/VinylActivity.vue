<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { deleteVinylPlay, getVinylActivity } from '../services/vinyls';
import type { VinylPlay } from '../types';

type ActivityItem = VinylPlay & { dateString: string; timeString: string; showTrash: boolean };

const vinylActivity = ref<ActivityItem[]>([]);
const loading = ref(false);
const deleting = ref(false);

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' } as const;
const timeOptions = { hour: 'numeric', minute: '2-digit' } as const;

onMounted(async () => {
  loading.value = true;
  try {
    const result = await getVinylActivity();
    vinylActivity.value = result.map((a) => {
      const date = new Date(a.timestamp);
      return {
        ...a,
        dateString: date.toLocaleDateString('en-US', dateOptions),
        timeString: date.toLocaleTimeString('en-US', timeOptions),
        showTrash: false,
      };
    });
  } finally {
    loading.value = false;
  }
});

const isToday = (timestamp: string) => {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
};

const nowPlaying = computed(() =>
  vinylActivity.value[0] && isToday(vinylActivity.value[0].timestamp)
    ? vinylActivity.value[0]
    : null
);

const historyItems = computed(() =>
  nowPlaying.value ? vinylActivity.value.slice(1) : vinylActivity.value
);

const deletePlay = async (row: ActivityItem) => {
  deleting.value = true;
  await deleteVinylPlay(row.vinylId, row.playId);
  deleting.value = false;
  vinylActivity.value = vinylActivity.value.filter((a) => a.playId !== row.playId);
}

</script>

<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-if="nowPlaying">
    <div
      class="now-playing"
      :style="{ backgroundColor: nowPlaying.albumColors?.length ? nowPlaying.albumColors[0] + '30' : 'hsl(25, 25%, 18%)' }"
      @click="$router.push(`/catalog/${nowPlaying.vinylId}`)"
    >
      <div class="now-playing-label">
        <div>Now Playing</div>
        <button :disabled="deleting" class="icon-button" @click.stop="deletePlay(nowPlaying)">
          <img class="icon" src="../assets/icons/delete.png" />
        </button>
      </div>
      <div class="now-playing-body">
        <img class="now-playing-art" :src="nowPlaying.imageUrl" :alt="nowPlaying.album" />
        <div
          class="vinyl-disc"
          :style="{
            backgroundColor: nowPlaying.albumColors?.[0] ?? 'hsl(33, 25%, 72%)',
            background: nowPlaying.albumColors?.length
              ? `radial-gradient(
                  circle at top center,
                  ${nowPlaying.albumColors[0]}80 40%,
                  ${nowPlaying.albumColors[0]}30 95%,
                  hsl(25, 25%, 18%) 100%
                )`
              : `radial-gradient(
                  circle at top center,
                  hsl(25, 25%, 28%) 0%,
                  hsl(25, 25%, 18%) 100%
                )`,
          }"
        >
          <div class="vinyl-disc-name">{{ nowPlaying.album }}</div>
        </div>
        <div class="now-playing-info">
          <div
            class="now-playing-album"
            :style="{ color: nowPlaying.albumColors?.length ? nowPlaying.albumColors[0] : 'white' }"
          >
            {{ nowPlaying.album }}
          </div>
          <div class="now-playing-artist">{{ nowPlaying.artist }}</div>
          <div class="now-playing-artist">{{ nowPlaying.timeString }}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="plays" v-if="historyItems.length > 0">
    <div
      class="play-item"
      v-for="row in historyItems"
      :style="{ backgroundColor: row?.albumColors?.length ? row.albumColors[0] + '30' : 'hsl(25, 25%, 18%)' }"
      @click="row.showTrash=!row.showTrash"
    >
      <div class="album-info" @click="$router.push(`/catalog/${row.vinylId}`)">
        <img class="album-art" :src="row.imageUrl" :alt="row.album">
        <div>
          <div class="album">
            <span class="album-name" :style="{ color: row?.albumColors?.length ? row.albumColors[0] : 'white' }">
              {{ row.album }}
            </span>
            <span class="album-sides" v-if="row.sides.length < row.nSides">
              {{ row.sides.join(', ') }}
            </span>
          </div>
          <div class="artist">{{ row.artist }}</div>
        </div>
      </div>
      <div class="play-item-right">
        <div>
          <div class="date">{{ row.dateString }}</div>
          <div class="time">{{ row.timeString }}</div>
        </div>
        <div v-if="row.showTrash">
          <button :disabled="deleting" class="icon-button" @click="deletePlay(row)">
            <img class="icon" src="../assets/icons/delete.png" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .loading {
    padding: 32px 0;
    text-align: center;
    color: hsl(33, 25%, 72%);
  }

  .icon-button {
    margin-right: 10px;
    width: 30px;
    height: 30px;
    background: none;
  }

  .now-playing {
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .now-playing-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: hsl(33, 25%, 72%);
    margin-bottom: 6px;
  }
  
  .now-playing-label .icon-button {
    width: 20px;
    height: 20px;
  }
  
  .now-playing-label .icon-button img {
    width: 15px;
    height: 15px;
  }

  .now-playing-body {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  .vinyl-disc {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-left: -60px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin 3s linear infinite;
  }

  .vinyl-disc-name {
    border-radius: 50%;
    background-color: black;
    width: 30px;
    height: 30px;
    font-size: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .now-playing-art {
    width: 90px;
    height: 90px;
    flex-shrink: 0;
    z-index: 2;
  }

  .now-playing-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
  }

  .now-playing-album {
    font-size: 20px;
    font-weight: bold;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .now-playing-artist {
    color: hsl(33, 20%, 72%);
    font-size: 15px;
  }

  .now-playing-sides {
    color: hsl(33, 25%, 72%);
    font-size: 13px;
  }

  .plays {
    margin-bottom: 60px;
  }

  .play-item {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 4px;
    padding-right: 8px;
    align-items: center;
    justify-content: space-between;
    background-color: hsl(25, 25%, 18%);
    margin-bottom: 8px;
    cursor: pointer;
  }

  .play-item-right {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    gap: 10px;
  }

  .album-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .album-art {
    height: 50px;
  }

  .album {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .album-name {
    font-weight: bold;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    line-height: 1.4;
  }

  .album-sides {
    color: hsl(33, 25%, 72%);
    font-size: 14px;
  }

  .artist {
    color: hsl(33, 20%, 72%);
    font-size: 15px;
  }

  .date, .time {
    text-align: right;
    margin-left: 4px;
    font-size: 15px;
  }

  .time {
    color: hsl(33, 25%, 72%);
    font-size: 14px;
  }
</style>
