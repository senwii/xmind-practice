import getBillList from '../apis/getBillList'
import getCategoryList from '../apis/getCategoryList'
import getSortMonthRevenue from '../apis/getSortMonthRevenue'
import deleteBill from '../apis/deleteBill'
import addBill from '../apis/addBill'

export default function reducer(state, action) {
  switch(action.type) {
    case 'updateState': {
      return {
        ...state,
        ...(action.payload || {}),
      }
    }
    case 'getBillList': {
      getBillList(action.params)
      return state
    }
    case 'getCategoryList': {
      getCategoryList(action.params)
      return state
    }
    case 'getSortMonthRevenue': {
      getSortMonthRevenue(action.params)
      return state
    }
    case 'deleteBill': {
      deleteBill(action.params)
      return state
    }
    case 'addBill': {
      addBill(action.params)
      return state
    }
    default:
      return state
  }
}
