const { valiAssert } = require('../util')

module.exports = {
  route: '/xmind/practice/getBillList',
  method: 'GET',
  params: { // ① 接口参数配置
    /**
     * 键：参数名，问号结尾表示可选参数（可选参数只有在实际传了才会调用解析函数；必选参数无论是否传了都会调解析函数，所以需要在解析函数内判断存在性）
     * 值：解析函数，返回参数被解析后的值，参数校验也在这里执行，不通过就抛出错误
     */
    'category?': value => {
      valiAssert(value, 'String(value).trim().length >= 0', '400; 类目参数不合法') // ② 错误中间件会解析符合【<code>;<message>】格式的Error，获取对应错误码和信息，返回给客户端
      return String(value).trim()
    },
    'month?': value => {
      valiAssert(value, 'String(value).trim().length >= 0', '400; 月份必须是正整数')

      if (String(value).trim() === '') {
        return ''
      }

      valiAssert(value, 'typeof +value === "number"', '400; 月份必须是正整数')
      valiAssert(value, '/^[1-9]\\d*$/.test(+value)', '400; 月份必须是正整数')
      valiAssert(value, '+value > 0 && +value <= 12', '400; 月份参数不合法')
      return +value
    },
  },
  controller: require('./controller.js'), // ③ 控制器，处理接口逻辑，签名：async (ctx, next) => any
}
