const assert = require('assert')

/**
 * 校验表达式，报错或假值会抛出指定错误
 * 
 * 默认注入的变量名是`value`，可通过参数`variableName`设置，此变量可直接在`expression`中使用
 * 
 * 注：⑴ `expression`在new Function中执行，所以部分正则表达式需要转义：/\d/ => /\\\d/
 * 
 * 注：⑵ `expression`执行结果为0时，因为0是假值也会触发拋错，可能跟预期不符，故`expression`最好返回布尔值：value.length => value.length >= 0
 * @param {*} value 
 * @param {*} expression 
 * @param {*} errorMsg 
 * @param {*} variableName 
 */
function valiAssert(value, expression, errorMsg, variableName) {
  let result
  try {
    result = new Function(variableName || 'value', `return ${expression}`)(value)
    assert(result)
  } catch(err) {
    throw new Error(errorMsg)
  }
}

/**
 * 通用数字数组操作
 * @param {string} operator 
 * @param {Number[]} numArr 
 */
function operateArray(operator, numArr) {
  const [bigValueArray, precisionArray, exponent] = numArr.reduce((memo, num, index) => {
    const [left, right, exp] = (num + '.').split(/[\.e]/i)
    const bigValue = BigInt(Number(exp ? `${left}${right}e${exp}` : `${left}${right}`))
    const precision = BigInt(right.length)

    memo[0][index] = bigValue
    memo[1][index] = precision

    if (memo[2] < precision) {
      memo[2] = precision
    }

    return memo
  }, [[], [], 0n])

  const expandResult = bigValueArray.reduce((memo, bignum, index) => {
    const expandedCurrent = BigInt(bignum * 10n ** (exponent - precisionArray[index]))
    if (index === 0) {
      return expandedCurrent
    }

    return new Function('x', 'y', `return x ${operator} y`)(memo, expandedCurrent)
  }, 0n)

  return Number(expandResult) / Number(10n ** exponent)
}

/**
 * 数字相加
 * @param  {...Number} args
 * @returns Number
 */
function addition(...args) {
  return operateArray('+', args)
}

/**
 * 数字相减
 * @param  {...Number} args
 * @returns Number
 */
function subtract(...args) {
  return operateArray('-', args)
}

/**
 * 加锁；如果当前锁已经存在且未过期则等待，直到加锁成功或者超时（默认3s）
 * @param {Redis.Client} ctx 
 * @param {String} lockKey 
 * @param {ms} timeout 
 * @returns {function } deleteLock 操作成功，则返回删除锁的函数；其他情况无返回值
 */
function addLockUntilAvailable(ctx, lockKey, timeout = 3000) {
  return new Promise(async (resolve, reject) => {
    const startstamp = Date.now()
    const deleteLock = async function() {
      return await ctx.db.del(lockKey)
    }
    let success

    do {
      const now =  Date.now()
      // ① setnx判断是否设置lock成功
      success = await ctx.db.setnx(lockKey, now + timeout)

      if (success) {
        await ctx.db.expire(lockKey, timeout / 1000)
        resolve(deleteLock)
        return
      } else {
        // ② get当前lock值
        const expireTime = await ctx.db.get(lockKey)

        if (expireTime && Date.now() > expireTime) {
          // ③ getset返回值跟get相同，说明当前占据lockKey字段，值是准确的
          const oldExpiredTime = await ctx.db.getset(lockKey, now + timeout)

          if (oldExpiredTime === expireTime) {
            await ctx.db.expire(lockKey, timeout / 1000)
            resolve(deleteLock)
            return
          } else {
            continue
          }
        }

        if (Date.now() - startstamp >= timeout) {
          reject(new Error('500; 服务器等待超时'))
        }
      }
    } while(!success)
  })
}

module.exports = {
  valiAssert,
  addition,
  subtract,
  addLockUntilAvailable,
}
