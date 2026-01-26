import PersonnelLayout from '../layouts/PersonnelLayout.vue'
import CommitteeLayout from '../layouts/CommitteeLayout.vue'
import EvaluateeLayout from '../layouts/EvaluateeLayout.vue'

export const routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/auth',
    },

    // Personnel routes
    {
        path: '/personnel',
        name: 'personnel',
        meta: {
            requireAuth: true,
            requireRole: 'Personnel',
            isPublic: false
        },
        redirect: '/personnel/index',
        component: PersonnelLayout,
        children: [
            {
                path: 'index',
                name: 'personnel.index',
                component: () => import('../pages/personnel/Index.vue')
            },
            {
                path: 'topics',
                name: 'personnel.topics',
                component: () => import('../pages/personnel/Topics.vue')
            },
            {
                path: 'indicators',
                name: 'personnel.indicators',
                component: () => import('../pages/personnel/Indicators.vue')
            },
            {
                path: 'periods',
                name: 'personnel.periods',
                component: () => import('../pages/personnel/Periods.vue')
            },
            {
                path: 'committee',
                name: 'personnel.committee',
                component: () => import('../pages/personnel/Committee.vue')
            },
            {
                path: 'department',
                name: 'personnel.department',
                component: () => import('../pages/personnel/Department.vue')
            },
            {
                path: 'position',
                name: 'personnel.position',
                component: () => import('../pages/personnel/Position.vue')
            },
            {
                path: 'assignment',
                name: 'personnel.assignment',
                component: () => import('../pages/personnel/Assignment.vue')
            },
            {
                path: 'evaluatee',
                name: 'personnel.evaluatee',
                component: () => import('../pages/personnel/Evaluatee.vue')
            },
        ]
    },

    // Committee routes
    {
        path: '/committee',
        name: 'committee',
        redirect: '/committee/index',
        meta: {
            requireAuth: true,
            requireRole: 'Evaluator',
            isPublic: false
        },
        component: CommitteeLayout,
        children: [
            {
                path: 'index',
                name: 'committee.index',
                component: () => import('../pages/committee/Index.vue')
            },
            {
                path: 'evaluate',
                name: 'committee.evaluate',
                component: () => import('../pages/committee/Evaluate.vue')
            },
            {
                path: 'evaluate/:periodId/:evaluateeId',
                name: 'committee.evaluateForm',
                component: () => import('../pages/committee/EvaluateForm.vue')
            },
        ]
    },

    // Evaluatee routes
    {
        path: '/evaluatee',
        name: 'evaluatee',
        redirect: '/evaluatee/index',
        meta: {
            requireAuth: true,
            requireRole: 'Evaluatees',
            isPublic: false
        },
        component: EvaluateeLayout,
        children: [
            {
                path: 'index',
                name: 'evaluatee.index',
                component: () => import('../pages/evaluatee/Index.vue')
            },
            {
                path: 'self-evaluate',
                name: 'evaluatee.selfEvaluate',
                component: () => import('../pages/evaluatee/SelfEvaluate.vue')
            },
            {
                path: 'self-evaluate/:periodId',
                name: 'evaluatee.selfEvaluateForm',
                component: () => import('../pages/evaluatee/SelfEvaluateForm.vue')
            },
            {
                path: 'results',
                name: 'evaluatee.results',
                component: () => import('../pages/evaluatee/Results.vue')
            },
        ]
    },

    { path: '/auth', name: 'auth', meta: { requireAuth: false, isPublic: true }, component: () => import('../pages/Auth.vue') },
    { path: '/:pathMatch(.*)*', name: 'notfound', meta: { requireAuth: false }, component: () => import('../pages/404.vue') }
]