<template>
    <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col items-center space-y-2">
            <h2 class="text-9xl font-bold">404</h2>
            <p class="text-3xl font-light">Opps! Something went wrong</p>
            <p class="text-lg font-light">The page you're looking for doesn't exits.</p>

            <RouterLink to="/" class="mt-5 px-4.5 py-2 rounded-full bg-sky-500 text-white font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-600">Back to Home</RouterLink>
        </div>
    </div>
</template>