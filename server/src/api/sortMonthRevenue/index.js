const { valiAssert } = require('../util')

module.exports = {
  route: '/xmind/practice/sortMonthRevenue',
  method: 'GET',
  params: {
    'month': value => {
      valiAssert(value, 'value || value === 0', '400; 缺少月份参数')
      valiAssert(value, 'typeof +value === "number"', '400; 月份必须是正整数')
      valiAssert(value, '/^[1-9]\\d*$/.test(+value)', '400; 月份必须是正整数')
      valiAssert(value, '+value > 0 && +value <= 12', '400; 月份参数不合法')
      return +value
    },
  },
  controller: require('./controller.js'),
}
