<script setup>
import { ref } from 'vue'
import * as lucide from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import UserProfile from './Profiles/UserProfile.vue';

const route = useRoute();
const isOpen = ref(true);
const props = defineProps({
    menu: {
        type: Array,
        required: true
    }
});

const isActive = (link) => {
    return route.path === link;
}
</script>

<template>
    <transition name="slide">
        <aside :class="isOpen ? 'w-64' : 'w-17 transition-all duration-300 ease-in-out'"
            class="flex flex-col h-screen bg-gray-50/50 border-r border-gray-200/70 sticky top-0">
            <!-- Sidebar Header -->
            <div :class="isOpen ? 'p-4' : 'px-3.5 py-4'"
                class="flex items-center justify-between border-b border-gray-200/70">
                <h1 v-if="isOpen" class="text-2xl font-bold text-zinc-700">PES <span class="text-sky-500">SYSTEM</span>
                </h1>

                <!-- Hidden menu -->
                <button @click="isOpen = !isOpen"
                    class="p-2 hover:bg-zinc-100 rounded-full transition-all duration-300 ease-in-out">
                    <component :is="lucide.PanelRightClose" class="w-5 h-5 cursor-pointer" />
                </button>
            </div>

            <!-- Sidebar Menu -->
            <nav class="px-2.5 py-4">
                <ul class="space-y-1">
                    <li v-for="items in menu" :key="items.title">
                        <RouterLink :to="items.link"
                            class="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-30 ease-in-out"
                            :class="isActive(items.link) ? 'bg-sky-500 text-white' : 'hover:bg-zinc-100'">
                            <component :is="lucide[items.icon]" class="w-5 h-5" />
                            <span v-if="isOpen">{{ items.title }}</span>
                        </RouterLink>
                    </li>
                </ul>
            </nav>

            <!-- Sidebar Footer -->
            <div class="mt-auto p-2.5">
                <UserProfile :isOpen="isOpen" />
            </div>
        </aside>
    </transition>
</template>