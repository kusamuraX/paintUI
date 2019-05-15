import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'paint',
      component: require('@/components/Paint').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
