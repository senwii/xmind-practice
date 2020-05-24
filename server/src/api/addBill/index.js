const { valiAssert } = require('../util')

module.exports = {
  route: '/xmind/practice/addBill',
  method: 'POST',
  params: {
    'time': value => {
      valiAssert(value, 'typeof +value === "number"', '400; 请传递有效时间戳')
      valiAssert(value, '/^\\d+$/.test(+value)', '400; 请传递有效时间戳')
      valiAssert(value, 'isFinite(new Date(+value))', '400; 请传递有效时间戳')
      return +value
    },
    'category': value => {
      valiAssert(value, 'value.trim()', '400; 请选择有效类目')
      return value.trim()
    },
    'amount': value => {
      valiAssert(value, 'typeof +value === "number"', '400; 金额应为非负数')
      valiAssert(value, '+value >= 0', '400; 金额应为非负数')
      valiAssert(value, '+value !== Infinity', '400; 金额过大')
      return +value
    }
  },
  controller: require('./controller.js'),
}
