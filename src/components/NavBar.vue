<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const showDropdown = ref(false);

const close = (e : any) => {
  const className = e.target.classList[0];
  if (!className?.includes('add-button')) {
    showDropdown.value = false;
  }
};

const addToCatalog = () => {
  router.push('/catalog/add');
}

onMounted(() => {
  document.addEventListener('click', close);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', close);
});
</script>

<template>
  <footer>
    <div class="tabs">
      <div
        :class="'tab' + ($route.path === '/' ? ' selected' : '')"
        @click="$router.push('/')"
      >
        <img class="icon" src="../assets/icons/vinyl.png" />
        <span class="tab-name">Turntable</span>
      </div>
      <div
        :class="'tab' + ($route.path === '/stats' ? ' selected' : '')"
        @click="$router.push('/stats')"
      >
        <img class="icon" src="../assets/icons/graph.png" />
        <span class="tab-name">Stats</span>
      </div>
      <div
        :class="'tab' + ($route.path.includes('/catalog') && !$route.path.includes('/catalog/add') ? ' selected' : '')"
        @click="$router.push('/catalog')"
      >
        <img class="icon" src="../assets/icons/vinyls.png" />
        <span class="tab-name">Crate</span>
      </div>
      <div :style="{ width: '420px', background: 'hsl(21, 48%, 11%)' }" />
      <div class="add-button-container">
        <button
          :class="'add-button' + ($route.path.includes('/catalog/add') ? ' add-button-selected' : '')"
          @click="addToCatalog"
        >
          <img class="add-button-icon" src="../assets/icons/plus.png" />
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
  footer {
    background-color: hsl(21, 48%, 11%);
    position: fixed;
    bottom: 0;
    left: 0;
    height: 72px;
    width: 100%;
  }

  .tabs {
    display: flex;
  }
  
  .tab {
    width: 100%;
    text-align: center;
    padding-top: 10px;
    background-color: hsl(21, 48%, 11%);
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    border-top: 1px solid #ece0d1;
  }
  
  .selected {
    font-weight: bold;
    background-color: hsl(21, 48%, 6%);
    height: 70px;
    margin-top: -10px;
  }
  
  .icon {
    width: 30px;
  }

  .tab-name {
    margin-bottom: 30px;
  }

  .selected .tab-name {
    margin-bottom: 10px;
  }

  .add-button-container {
    background-color: hsl(21, 48%, 11%);
    position: fixed;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    width: 105px;
    height: 105px;
  }

  .add-button {
    background-color: hsl(21, 48%, 4%);
    border-radius: 50%;
    width: 85px;
    height: 85px;
    font-size: 42px;
    padding: 0;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .add-button-selected {
    border: 2px solid white;
  }

  .add-button-icon {
    width: 32px;
  }
</style>