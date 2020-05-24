import loadable from '@loadable/component'

const routes = [
  {
    path: '/byRecord',
    component: loadable(() => import(/* webpackChunkName: "byRecord" */ './views/ByRecord/index.jsx')),
  },
  {
    path: '/byCategory',
    component: loadable(() => import(/* webpackChunkName: "byCategory" */ './views/ByCategory/index.jsx')),
  },
]

export const baseName = '/app/xmind-practice-client'

export default routes
