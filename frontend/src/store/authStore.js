import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user')));

    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => user.value?.role);

    // set token, userData เมื่อ login
    const setAuth = (newToken, userData) => {
        token.value = newToken;
        user.value = userData;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    // set user เมื่อมีการ update user
    const setUser = (newUser) => {
        user.value = newUser;
        localStorage.setItem('user', JSON.stringify(newUser));
    }

    // remove token, userData เมื่อ logout
    const logout = () => {
        token.value = null;
        user.value = null;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return {
        token,
        user,
        isAuthenticated,
        userRole,
        setAuth,
        setUser,
        logout,
    }
})