import axios from 'axios';
import type { DiscogsVinyl, Vinyl, VinylPlay } from '../types';
import { getAuth } from 'firebase/auth';
import { setupCache, type CacheAxiosResponse, type CachedStorageValue } from 'axios-cache-interceptor';

const CACHE_KEYS = {
  LIST_VINYLS: 'list-vinyls',
  LIST_PLAYS: 'list-vinyl-plays',
  vinyl: (id: string) => `vinyl-${id}`,
};

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
service.interceptors.request.use(async (config) => {
  const token = await getAuth().currentUser?.getIdToken();
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});
setupCache(service);

export const getVinyls = async () : Promise<Vinyl[]> => {
  try {
    // @ts-ignore
    const response = await service.get('/vinyls', { id: CACHE_KEYS.LIST_VINYLS });
    const data = response.data;
    data.sort((a: any, b: any) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      if (a.artist.toLowerCase() > b.artist.toLowerCase()) return 1
      if (a.artist.toLowerCase() < b.artist.toLowerCase()) return -1
      if (a.published > b.published) return 1

      return -1
    });
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const createVinyl = async (discogsId: string | undefined) => {
  return service.post('/vinyls', { discogsId }, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_VINYLS]: (cache: CachedStorageValue,vinylResponse: CacheAxiosResponse) => {
          if (cache.state !== 'cached') return 'ignore';
          cache.data.data = [vinylResponse.data].concat(cache.data.data);

          return cache;
        }
      }
    }
  });
}

export const getVinyl = async (id: string): Promise<Vinyl> => {
  // @ts-ignore
  const response = await service.get(`/vinyls/${id}`, { id: CACHE_KEYS.vinyl(id) });
  return response.data;
}

export const favoriteVinyl = async (id: string, favorite: boolean): Promise<Vinyl> => {
  const response = await service.put(`/vinyls/${id}/favorite`, { favorite }, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_VINYLS]: (cache: CachedStorageValue) => {
          if (cache.state !== 'cached') return 'ignore';
          // @ts-ignore
          cache.data.data = cache.data.data.map(
            (v: Vinyl) => v.id === id ? { ...v, favorite } : v
          );
          return cache;
        },
        [CACHE_KEYS.vinyl(id)]: (cache: CachedStorageValue, res: CacheAxiosResponse) => {
          if (cache.state !== 'cached') return 'ignore';
          cache.data.data = { ...res.data, id };
          return cache;
        },
      }
    }
  });
  return response.data;
}

export const updateVinyl = async (id: string, data: Vinyl): Promise<Vinyl> => {
  const response = await service.put(`/vinyls/${id}`, data, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_VINYLS]: (cache: CachedStorageValue) => {
          if (cache.state !== 'cached') return 'ignore';
          // @ts-ignore
          cache.data.data = cache.data.data.map(
            (v: Vinyl) => v.id === id ? { ...v, ...data } : v
          );

          return cache;
        },
        [CACHE_KEYS.vinyl(id)]: (cache: CachedStorageValue) => {
          if (cache.state !== 'cached') return 'ignore';
          // @ts-ignore
          cache.data.data = { ...cache.data.data, ...data };
          return cache;
        },
      }
    }
  });
  return response.data;
}

export const deleteVinyl = async (id: string) => {
  return service.delete(`/vinyls/${id}`, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_VINYLS]: (cache: CachedStorageValue) => {
          if (cache.state !== 'cached') return 'ignore';
          // @ts-ignore
          cache.data.data = cache.data.data.filter((p: any) => p.id !== id);

          return cache;
        }
      }
    }
  });
}

export const searchVinyls = async (term: string) : Promise<DiscogsVinyl[]> => {
  try {
    const response = await service.get(`music/discogs/search?album=${term}`);
    return response.data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export const getDiscogsVinyl = async (discogsId: string) : Promise<Vinyl | undefined> => {
  try {
    const response = await service.get(`music/discogs/release/${discogsId}`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

export const getVinylActivity = async () : Promise<VinylPlay[]> => {
  try {
    // @ts-ignore
    const response = await service.get('/vinyls/history', { id: CACHE_KEYS.LIST_PLAYS });
    return response.data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export const playVinyl = async (id: string, data: { sides: number[] }) => {
  await service.post(`/vinyls/${id}/plays`, data, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_PLAYS]: (cache: CachedStorageValue, playResponse: CacheAxiosResponse) => {
          if (cache.state !== 'cached') return 'ignore';
          cache.data.data = [playResponse.data].concat(cache.data.data);

          return cache;
        }
      }
    }
  });
}

export const deleteVinylPlay = async (vinylId: string, playId: string) => {
  await service.delete(`/vinyls/${vinylId}/plays/${playId}`, {
    // @ts-ignore
    cache: {
      update: {
        [CACHE_KEYS.LIST_PLAYS]: (cache: CachedStorageValue) => {
          if (cache.state !== 'cached') return 'ignore';
          // @ts-ignore
          cache.data.data = cache.data.data.filter((p: any) => p.playId !== playId);

          return cache;
        }
      }
    }
  });
}
