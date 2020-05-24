import axios from 'axios'
import { APIHOST } from '../libs/constants'
import { Toast } from '../libs/util'

// 获取账单类型列表
export default async function getCategoryList({ dispatch }) {
  return axios(`//${APIHOST}/xmind/practice/getAllCategory`)
    .then(async res => {
      const { code, error, data } = res.data || {}

      if (code !== 200) {
        throw new Error(error)
      } else {
        dispatch({
          type: 'updateState',
          payload: {
            cateList: data || [],
          },
        })
      }
    })
    .catch(async err => {
      Toast.set({
        type: 'error',
        message: err.message || '获取类型失败',
      })
      await Toast.goto('in')
      await Toast.delay(1000)
      await Toast.goto('out')
    })
}
