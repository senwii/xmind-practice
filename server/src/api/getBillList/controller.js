const { addition, subtract } = require('../util')

const handler = async (ctx, next) => {
  const { month, category } = ctx.parsedQuery
  let recordKeys = []

  if (month || category) {
    let filterKeyMap = new Map()

    function collectMap(map, keys) {
      keys.map(timeBillKey => {
        const billKey = timeBillKey.split('_')[1]
        const exist = map.has(billKey)

        if (exist) {
          const val = map.get(billKey)
          map.set(billKey, val + 1)
        } else {
          map.set(billKey, 0)
        }
      })

      return map
    }

    if (month) {
      const filterTimeKeys = await ctx.db.zrangebyscore('bill:month-time_key-zset', month, month)
      filterKeyMap = collectMap(filterKeyMap, filterTimeKeys)
    }

    if (category) {
      const categoryId = await ctx.db.hget('category:idstr-id-hash', category)

      if (categoryId === null) {
        ctx.status = 500
        return ctx.body = {
          code: 500,
          error: '类目不存在',
        }
      }
      const categoryFilterKeys = await ctx.db.zrangebyscore('bill:categoryid-time_key-zset', categoryId, categoryId)
      filterKeyMap = collectMap(filterKeyMap, categoryFilterKeys)
    }

    if (month && category) {
      recordKeys = [...filterKeyMap.keys()].filter(key => filterKeyMap.get(key) >= 1)
    } else {
      recordKeys = [...filterKeyMap.keys()]
    }
  } else {
    recordKeys = await ctx.db.zrange('bill:timestamp-key-zset', 0, -1)
  }

  await Promise.resolve().then(async () => {
    const responseData = await recordKeys.reduce(async (acc, recordkey) => {
      const data = await ctx.db.hgetall(recordkey)
      const { id, type, time, category, categoryName, amount } = data || {}
      acc = await acc

      acc.list.push({
        id,
        type: Number(type),
        time: Number(time),
        categoryId: String(category),
        categoryName: String(categoryName),
        amount: Number(amount).toFixed(2),
      })

      if (Number(type) === 0) {
        acc.expend = addition(acc.expend, Number(amount))
        acc.total = subtract(acc.total, Number(amount))
      } else if (Number(type) === 1) {
        acc.income = addition(acc.income, Number(amount))
        acc.total = addition(acc.total, Number(amount))
      }

      return acc
    }, {
      list: [],
      income: 0,
      expend: 0,
      total: 0,
    })

    responseData.income = responseData.list.length > 0 ? responseData.income.toFixed(2) : null
    responseData.expend = responseData.list.length > 0 ? responseData.expend.toFixed(2) : null
    responseData.total = responseData.list.length > 0 ? responseData.total.toFixed(2) : null
    return responseData
  })
  .then(data => {
    ctx.status = 200
    ctx.body = {
      code: 200,
      data: data,
    }
  })
  .catch(() => {
    ctx.status = 500
    ctx.body = {
      code: 500,
      error: '获取数据失败',
    }
  })
}

module.exports = async (ctx, next) => await handler(ctx, next)
