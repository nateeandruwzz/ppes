import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '../store/authStore'

export const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    const { requireAuth, requireRole, isPublic } = to.meta;
    const { isAuthenticated, userRole } = authStore;

    // Helper function
    const redirectByRole = (role) => {
        const roleRoutes = {
            Personnel: '/personnel',
            Evaluator: '/committee',
            Evaluatees: '/evaluatee'
        }

        return roleRoutes[role]
    }

    // ต้องการ login แต่หากยังไม่ได้ login
    if (requireAuth && !isAuthenticated) {
        if (to.path !== '/auth') {
            return next('/auth')
        }
        return next()
    }

    // login แล้วแต่พยายามเข้าหน้า public
    if (isPublic && isAuthenticated) {
        const targetPath = redirectByRole(userRole)
        if (to.path !== targetPath) {
            return next(targetPath)
        }
        return next();
    }

    // ตรวจสอบสิทธิ๋การเข้าถึง
    if (requireAuth && requireRole && userRole !== requireRole) {
        const targetPath = redirectByRole(userRole)

        if (to.path !== targetPath) {
            return next(targetPath)
        }

        return next();
    }

    next();
})
