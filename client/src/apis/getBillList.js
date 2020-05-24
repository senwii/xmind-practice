import axios from 'axios'
import { ALL_CATEGORY_ITEM, APIHOST } from '../libs/constants'
import { Toast } from '../libs/util'

// 获取账单列表
export default async function getBillList({ dispatch, month, categoryId, showtoast = true }) {
  let categoryParam = ''
  if (categoryId !== null && categoryId !== ALL_CATEGORY_ITEM.id) {
    categoryParam = `&category=${categoryId}`
  }
  if (showtoast) {
    await Toast.goto('out')
    Toast.set({
      type: 'loading',
      message: '加载中',
    })
    await Toast.goto('in')
  }
  return axios(`//${APIHOST}/xmind/practice/getBillList?month=${month}${categoryParam}`)
    .then(async res => {
      const { code, error, data } = res.data || {}

      if (code !== 200) {
        throw new Error(error)
      } else {
        const { list, income, expend, total } = data || {}

        dispatch({
          type: 'updateState',
          payload: {
            billList: list || [],
            income,
            expend,
            total,
          },
        })

        if (showtoast) {
          await Toast.goto('out')
        }
      }
    })
    .catch(async err => {
      if (showtoast) {
        Toast.set({
          type: 'error',
          message: err.message || '账单加载失败',
        })
        await Toast.goto('in')
        await Toast.delay(1000)
        await Toast.goto('out')
      }
    })
}
