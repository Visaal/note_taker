import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import NoteBook from '@/components/NoteBook'

Vue.use(Router)

export default new Router({
  mode: 'history', // this uses the history api to avoid the # in the url
  linkActiveClass: 'is-active', // needed as Bulma uses the is-active flag on links rather than the default active one
  scrollBehavior: (to, from, savedPosition) => ({ y: 0 }), // means that any new page that is loaded starts at the top - could use {if(savedPosition) {return SavedPosition}} to use the last position on the page
  routes: [
    { path: '/', name: 'HelloWorld', component: HelloWorld },
    { path: '/notebook', name: 'NoteBook', component: NoteBook }
  ]
})
