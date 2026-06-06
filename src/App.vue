<script setup lang="ts">
import { useRouter } from 'vue-router';
import PWABadge from './components/PWABadge.vue';
import { currentUser, userLoaded } from './firebaseApp';
import { signOut } from './services/users';
import NavBar from './components/NavBar.vue';

const router = useRouter();

const onLogout = async () => {
  try {
    console.log('SIgn out')
    await signOut();
    router.replace('/login');
  } catch (e) {
    console.log('There was an error signing out');
  }
}

</script>

<template>
  <div class="header">
    <a href="/" :style="{ color: 'white' }">
      <div class="title">
        <img :style="{ width: '32px', height: '32px' }" src="./assets/vinyl.png" />
        <h1>Record Crate</h1>
      </div>
    </a>
    
    <div class="icon-buttons" v-if="userLoaded && currentUser">
      <button v-if="$route.path.includes('/add')" class="icon-button" @click="$router.back()">
        <img class="icon" src="./assets/icons/back.png" />
      </button>
      <button class="icon-button" @click="onLogout">
        <img class="icon" src="./assets/icons/logout.png" />
      </button>
    </div>
  </div>
  <div class="app-content">
    <RouterView :key="$route.fullPath" />
    <PWABadge />
  </div>
  <NavBar />
</template>

<style scoped>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    height: 36px;
    background-color: hsl(21, 48%, 6%);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title h1 {
    font-size: 28px;
  }

  .icon-button {
    margin-right: 0px;
  }
</style>
