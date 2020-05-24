import axios from 'axios'
import { APIHOST } from '../libs/constants'
import { Toast } from '../libs/util'

// 按类型获取月份收支并排序
export default async function getSortMonthRevenue({ dispatch, month }) {
  await Toast.goto('out')
  Toast.set({
    type: 'loading',
    message: '加载中',
  })
  await Toast.goto('in')
  return axios(`//${APIHOST}/xmind/practice/sortMonthRevenue?month=${month}`)
    .then(async res => {
      const { code, error, data } = res.data || {}

      if (code !== 200) {
        throw new Error(error)
      } else {
        const { list, income, expend, total } = data || {}

        dispatch({
          type: 'updateState',
          payload: {
            cateGroupedBillList: list || [],
            income,
            expend,
            total,
          },
        })

        await Toast.goto('out')
      }
    })
    .catch(async err => {
      Toast.set({
        type: 'error',
        message: err.message || '账单加载失败',
      })
      await Toast.goto('in')
      await Toast.delay(1000)
      await Toast.goto('out')
    })
}
