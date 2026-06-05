<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const showDropdown = ref(false);

// const toggleDropdown = () => {
//   showDropdown.value = !showDropdown.value;
// };

const close = (e : any) => {
  const className = e.target.classList[0];
  if (!className?.includes('add-button')) {
    showDropdown.value = false;
  }
};

const addActivity = () => {
  router.push('/catalog');
}

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
        :class="'tab' + (!$route.path.includes('catalog') && !$route.path.includes('stats') ? ' selected' : '')"
        @click="$router.push('/')"
      >
        <img class="icon" src="../assets/icons/vinyl.png" />
        <span class="tab-name">Activity</span>
      </div>
      <div
        :class="'tab' + ($route.path.includes('stats') ? ' selected' : '')"
        @click="$router.push('/stats')"
      >
        <img class="icon" src="../assets/icons/graph.png" />
        <span class="tab-name">Stats</span>
      </div>
      <div
        :class="'tab' + ($route.path.includes('catalog') ? ' selected' : '')"
        @click="$router.push('/catalog')"
      >
        <img class="icon" src="../assets/icons/vinyls.png" />
        <span class="tab-name">Catalog</span>
      </div>
      <div :style="{ width: '410px', background: 'hsl(21, 42%, 11%)' }" />
      <div class="add-button-container">
        <div v-if="showDropdown" class="dropdown">
          <button class="option" @click="addActivity">Add Activity</button>
          <button class="option" @click="addToCatalog">Add to Catalog</button>
        </div>
        <button
          class="add-button"
          @click="addToCatalog"
          >
          <!-- @click="$router.push($route.path.includes('catalog') ? '/catalog/add' : '/catalog')" -->
          <img class="add-button-icon" src="../assets/icons/plus.png" />
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
  footer {
    background-color: hsl(21, 42%, 11%);
    position: fixed;
    bottom: 0;
    left: 0;
    height: 70px;
    width: 100%;
  }

  .tabs {
    display: flex;
  }
  
  .tab {
    width: 100%;
    text-align: center;
    padding-top: 10px;
    background-color: hsl(21, 42%, 11%);
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
    background-color: hsl(21, 42%, 6%);
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

  .dropdown {
    width: 250px;
    background-color: hsl(21, 42%, 11%);
    padding: 10px;
    margin-left: -200px;
    margin-top: -110px;
    position: fixed;
    right: 40;
    bottom: 40;
    font-size: 18px;
  }

  .dropdown .option {
    width: 100%;
    text-align: left;
    background-color: hsl(21, 42%, 4%);
    padding: 10px 15px;
    margin-top: 5px;
  }

  .add-button-container {
    background-color: hsl(21, 42%, 11%);
    position: fixed;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    width: 105px;
    height: 105px;
  }

  .add-button {
    background-color: hsl(21, 42%, 4%);
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

  .add-button-icon {
    width: 32px;
  }
</style>