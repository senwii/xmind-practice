const { valiAssert } = require('../util')

module.exports = {
  route: '/xmind/practice/delBill',
  method: 'DELETE',
  params: {
    'id': value => {
      valiAssert(value, 'value.trim()', '400; 缺少账单id')
      valiAssert(value, 'value.trim().length === 10', '400; 账单id不合法')
      return value
    }
  },
  controller: require('./controller.js'),
}
