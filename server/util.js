const crypto = require('crypto')

/**
 * 根据传入`data`生成摘要
 * 
 * 可以通过`validator`判断摘要是否符合要求：返回`false`会重新生成直到通过`validator`返回`true`；或者超时报错
 * @param {*} data 
 * @param {number} length 
 * @param {function} validator 
 * @param {number} timeout
 */
async function abstract(data, length = -1, validator = () => true, timeout = 3000) {
  const startstamp = Date.now()
  let hash

  if (arguments.length === 2) {
    if (typeof arguments[1] === 'function') {
      validator = length
    }
  }

  async function getData() {
    if (typeof data === 'function') {
      return await data()
    } else {
      return data
    }
  }

  do {
    if (Date.now() - startstamp > timeout) {
      throw new Error('500; 服务器处理超时')
    }
    hash = crypto
      .createHash('md5')
      .update(await getData())
      .digest('hex')
      .padEnd(length, ((Math.random() * 10 ** 10).toString(16)).replace(/\./g, ''))
      .slice(0, length)
  } while(!(await validator(hash)))

  return hash
}

module.exports = {
  abstract,
}
