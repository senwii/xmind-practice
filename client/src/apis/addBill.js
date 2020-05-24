import axios from 'axios'
import { APIHOST } from '../libs/constants'
import { Toast } from '../libs/util'

// 添加账单
export default async function addBill({ dispatch, time, category, amount, month, categoryId }) {
  return axios.post(`//${APIHOST}/xmind/practice/addBill`, {
    time,
    category,
    amount,
})
.then(async res => {
    const { code, error } = res.data || {}

    if (code !== 200) {
        throw new Error(error)
    } else {
        Toast.set({
            type: 'success',
            message: '添加成功',
        })

        dispatch({
          type: 'getBillList',
          params: {
            dispatch,
            month,
            categoryId,
            showtoast: false,
          }
        })

        await Toast.goto('in')
        await Toast.delay(1500)
        await Toast.goto('out')
    }
})
.catch(async err => {
    Toast.set({
        type: 'error',
        message: err.message || '账单创建失败',
    })
    await Toast.goto('in')
    await Toast.delay(1000)
    await Toast.goto('out')
})
}
