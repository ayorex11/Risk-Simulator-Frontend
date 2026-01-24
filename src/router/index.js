import { createRouter, createWebHistory } from 'vue-router'
import authService from '../services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('../views/LandingView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/verify-email/:token',
      name: 'VerifyEmail',
      component: () => import('../views/auth/VerifyEmailView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password/:token',
      name: 'ResetPassword',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vendors',
      name: 'Vendors',
      component: () => import('../views/VendorsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vendors/new',
      name: 'VendorNew',
      component: () => import('../views/VendorCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vendors/:id',
      name: 'VendorDetail',
      component: () => import('../views/VendorDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assessments',
      name: 'Assessments',
      component: () => import('../views/AssessmentsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assessments/new',
      name: 'AssessmentNew',
      component: () => import('../views/AssessmentCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assessments/:id',
      name: 'AssessmentDetail',
      component: () => import('../views/AssessmentDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assessments/:id/questionnaire',
      name: 'AssessmentQuestionnaire',
      component: () => import('../views/AssessmentQuestionnaireView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/organization/settings',
      name: 'OrganizationSettings',
      component: () => import('../views/OrganizationSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/organization/requests',
      name: 'OrganizationRequests',
      component: () => import('../views/OrganizationRequestsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/organization/members',
      name: 'MemberManagement',
      component: () => import('../views/MemberManagementView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
