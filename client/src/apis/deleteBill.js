import axios from 'axios'
import { APIHOST } from '../libs/constants'
import { Toast } from '../libs/util'

// 删除账单
export default async function deleteBill({ dispatch, id, month, categoryId }) {
  await Toast.goto('out')
  Toast.set({
    type: 'loading',
    message: '处理中',
  })
  await Toast.goto('in')
  return axios.delete(`//${APIHOST}/xmind/practice/delBill`, {
    params: {
      id,
    },
  })
    .then(async res => {
      const { code, error, data } = res.data || {}

      if (code !== 200) {
        throw new Error(error)
      } else {
        dispatch({
          type: 'getBillList',
          params: {
            dispatch,
            month,
            categoryId,
            showtoast: false,
          }
        })

        Toast.set({
          type: 'success',
          message: data || '删除成功，列表已更新',
        })
        await Toast.goto('in')
        await Toast.delay(1500)
        await Toast.goto('out')
      }
    })
    .catch(async err => {
      Toast.set({
        type: 'error',
        message: err.message || '删除失败',
      })
      await Toast.goto('in')
      await Toast.delay(1500)
      await Toast.goto('out')
    })
}
