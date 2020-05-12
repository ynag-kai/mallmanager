import Vue from 'vue'
import Router from 'vue-router'
import AppLogin from '@/components/login/AppLogin'
import AppHome from '@/components/AppHome'
import AppWelcome from '@/components/AppWelcome';
import AppUsers from '@/components/users/AppUsers';
import AppRights from '@/components/rights/AppRights';
import AppRoles from '@/components/rights/AppRoles'
import AppGoodsList from '@/components/goods/AppGoodsList'
import AppGoodsAdd from '@/components/goods/AppGoodsAdd'
import AppGoodsEdit from '@/components/goods/AppGoodsEdit'
import AppGoodsParams from '@/components/goods/AppGoodsParams'
import AppGoodsCategories from '@/components/goods/AppGoodsCategories'
import AppGoodsOrders from '@/components/orders/AppGoodsOrders'
import AppReports from '@/components/reports/AppReports'
// 单独引用 message
import { Message } from 'element-ui'

Vue.use(Router)

let router = new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: AppHome,
      children: [{
          path: '/',
          name: 'welcome',
          component: AppWelcome
        },
        {
          path: '/users',
          name: 'users',
          component: AppUsers
        },
        {
          path: '/rights',
          name: 'rights',
          component: AppRights
        },
        {
          path: '/roles',
          name: 'roles',
          component: AppRoles
        },
        {
          path: '/goods',
          name: 'goods',
          component: AppGoodsList
        },
        {
          path: '/goodsadd',
          name: 'goodsadd',
          component: AppGoodsAdd
        },
        {
          path: '/goodsedit/:id',
          name: 'goodsedit',
          component: AppGoodsEdit
        },
        {
          path: '/categories',
          name: 'categories',
          component: AppGoodsCategories
        },
        {
          path: '/orders',
          name: 'orders',
          component: AppGoodsOrders
        },
        {
          path: '/reports',
          name: 'reports',
          component: AppReports
        },
        {
          path: '/params',
          name: 'params',
          component: AppGoodsParams
        }, 
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: AppLogin
    },

  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 登录请求不验证
  if (to.name === 'login') {
    next()
  } else {
    // 其他情况 必须验证token
    let token = localStorage.getItem('token')
    if (!token) { // true 没有登录 token= null
      Message.warning('请先登录')
      // 跳转登录
      router.push({
        name: 'login'
      })
      return
    }
  }
  next()

})

export default router
