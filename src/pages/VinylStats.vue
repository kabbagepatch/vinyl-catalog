<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getVinylActivity, getVinyls } from '../services/vinyls';
import type { Vinyl, VinylPlay } from '../types';

const plays = ref<VinylPlay[]>([]);
const vinyls = ref<Vinyl[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    plays.value = await getVinylActivity();
    vinyls.value = await getVinyls();
  } finally {
    loading.value = false;
  }
});

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BAR_MAX_PX = 80;
const currentMonth = new Date().getMonth();

const totalPlays = computed(() => plays.value.length);

const uniqueAlbums = computed(() => vinyls.value.length);

const uniqueArtists = computed(() => new Set(vinyls.value.map(p => p.artist)).size);

const monthlyPlays = computed(() => {
  const year = new Date().getFullYear();
  const counts = Array(12).fill(0);
  plays.value
    .filter(p => new Date(p.timestamp).getFullYear() === year)
    .forEach(p => counts[new Date(p.timestamp).getMonth()]++);
  return counts.map((count, i) => ({ count, label: MONTH_LABELS[i], index: i }));
});

const monthlyMax = computed(() => Math.max(...monthlyPlays.value.map(m => m.count), 1));

// const yearlyPlays = computed(() => {
//   const byYear: Record<number, number> = {};
//   plays.value.forEach(p => {
//     const y = new Date(p.timestamp).getFullYear();
//     byYear[y] = (byYear[y] || 0) + 1;
//   });
//   return Object.entries(byYear)
//     .sort((a, b) => Number(a[0]) - Number(b[0]))
//     .map(([year, count]) => ({ year, count: Number(count) }));
// });

// const yearlyMax = computed(() => Math.max(...yearlyPlays.value.map(y => y.count), 1));

const mostPlayedVinyls = computed(() => {
  const counts: Record<string, { play: VinylPlay; count: number }> = {};
  plays.value.forEach(p => {
    if (!counts[p.vinylId]) counts[p.vinylId] = { play: p, count: 0 };
    counts[p.vinylId].count++;
  });
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);
});

const mostPlayedArtists = computed(() => {
  const counts: Record<string, number> = {};
  plays.value.forEach(p => { counts[p.artist] = (counts[p.artist] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([artist, count]) => ({ artist, count }));
});

const barHeight = (count: number, max: number) =>
  count === 0 ? 2 : Math.max(4, Math.round((count / max) * BAR_MAX_PX));
</script>

<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-else-if="plays.length === 0" class="loading">No plays recorded yet.</div>
  <div v-else class="stats">

    <!-- Chips -->
    <div class="chips">
      <div class="chip">
        <span class="chip-value">{{ totalPlays }}</span>
        <span class="chip-label">Plays</span>
      </div>
      <div class="chip">
        <span class="chip-value">{{ uniqueAlbums }}</span>
        <span class="chip-label">Vinyls</span>
      </div>
      <div class="chip">
        <span class="chip-value">{{ uniqueArtists }}</span>
        <span class="chip-label">Artists</span>
      </div>
    </div>

    <!-- Monthly bar chart -->
    <div class="section">
      <h3 class="section-title">This Year</h3>
      <div class="bar-chart">
        <div
          class="bar-col"
          v-for="month in monthlyPlays"
          :key="month.index"
        >
          <span class="bar-count" v-if="month.count">{{ month.count }}</span>
          <div
            class="bar"
            :class="{ 'bar-active': month.index === currentMonth }"
            :style="{ height: `${barHeight(month.count, monthlyMax)}px` }"
          />
          <span class="bar-label">{{ month.label }}</span>
        </div>
      </div>
    </div>

    <!-- Yearly bar chart -->
    <!-- <div class="section" v-if="yearlyPlays.length > 0">
      <h3 class="section-title">All Time</h3>
      <div class="bar-chart">
        <div
          class="bar-col"
          v-for="item in yearlyPlays"
          :key="item.year"
        >
          <span class="bar-count">{{ item.count }}</span>
          <div
            class="bar bar-active"
            :style="{ height: `${barHeight(item.count, yearlyMax)}px` }"
          />
          <span class="bar-label">{{ item.year }}</span>
        </div>
      </div>
    </div> -->

    <!-- Most played vinyl -->
    <div class="section" v-if="mostPlayedVinyls">
      <h3 class="section-title">Most Played</h3>
      <div
        v-for="vinyl in mostPlayedVinyls"
        class="top-item-card"
        :style="{ backgroundColor: vinyl.play.albumColors?.length ? vinyl.play.albumColors[0] + '25' : 'hsl(25, 25%, 18%)' }"
        @click="$router.push(`/catalog/${vinyl.play.vinylId}`)"
      >
        <img class="top-item-art" :src="vinyl.play.imageUrl" :alt="vinyl.play.album" />
        <div class="top-item-info">
          <div
            class="top-item-name"
            :style="{ color: vinyl.play.albumColors?.length ? vinyl.play.albumColors[0] : 'white' }"
          >
            {{ vinyl.play.album }}
          </div>
          <div class="top-item-sub">{{ vinyl.play.artist }}</div>
          <div class="top-item-count">{{ vinyl.count }} plays</div>
        </div>
      </div>
    </div>

    <!-- Most played artist -->
    <div class="section" v-if="mostPlayedArtists">
      <h3 class="section-title">Top Artists</h3>
      <div class="top-item-card top-item-card-flat" v-for="artist in mostPlayedArtists">
        <div class="top-item-info">
          <div class="top-item-name">{{ artist.artist }}</div>
          <div class="top-item-count">{{ artist.count }} plays</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
  .loading {
    padding: 32px 0;
    text-align: center;
    color: hsl(33, 25%, 62%);
  }

  .stats {
    padding-bottom: 80px;
  }

  .chips {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .chip {
    background-color: hsl(25, 25%, 18%);
    border-radius: 12px;
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
  }

  .chip-value {
    font-size: 22px;
    font-weight: bold;
  }

  .chip-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: hsl(33, 25%, 62%);
  }

  .section {
    margin: 10px 5px 16px 5px;
  }

  .section-title {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: hsl(33, 25%, 62%);
    margin: 0 0 10px 0;
    font-weight: normal;
  }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: calc(80px + 32px);
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
  }

  .bar-count {
    font-size: 9px;
    color: hsl(33, 25%, 62%);
    line-height: 1;
  }

  .bar {
    width: 100%;
    background-color: hsl(33, 30%, 32%);
    border-radius: 2px 2px 0 0;
    min-height: 2px;
  }

  .bar-active {
    background-color: hsl(33, 45%, 50%);
  }

  .bar-label {
    font-size: 9px;
    color: hsl(33, 20%, 55%);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
  }

  .top-item-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 6px 12px;
    margin: 4px 0;
    border-radius: 6px;
    cursor: pointer;
  }

  .top-item-card-flat {
    background-color: hsl(25, 25%, 18%);
    cursor: default;
  }

  .top-item-art {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
  }

  .top-item-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .top-item-name {
    font-size: 17px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .top-item-sub {
    font-size: 14px;
    color: hsl(33, 20%, 72%);
  }

  .top-item-count {
    font-size: 13px;
    color: hsl(33, 25%, 62%);
  }
</style>
