const { addition, subtract } = require('../util')

const handler = async (ctx, next) => {
  const { month } = ctx.parsedQuery

  await Promise.resolve().then(async () => {
    const timeRecordKeys = await ctx.db.zrangebyscore('bill:month-time_key-zset', month, month)

    const data = await timeRecordKeys.reduce(async (memo, timeRrecordKey) => {
      const recordKey = timeRrecordKey.split('_')[1]
      const recordData = await ctx.db.hgetall(recordKey)
      const { type, category, categoryName, amount } = recordData || {}

      memo = await memo

      const categoryData = memo.categoryMap.get(category)

      if (!categoryData) {
        memo.categoryMap.set(category, {
          type: Number(type),
          categoryId: String(category),
          categoryName: String(categoryName),
          accumulation: Number(amount),
        })
      } else {
        categoryData.accumulation = addition(categoryData.accumulation, Number(amount))
      }

      if (Number(type) === 0) {
        memo.expend = addition(memo.expend, Number(amount))
        memo.total = subtract(memo.total, Number(amount))
      } else if (Number(type) === 1) {
        memo.income = addition(memo.income, Number(amount))
        memo.total = addition(memo.total, Number(amount))
      }

      return memo
    }, {
      categoryMap: new Map(),
      income: 0,
      expend: 0,
      total: 0,
    })

    const { categoryMap, income, expend, total } = data

    const list = Array.from(categoryMap.values())
      .sort((prev, next) => next.accumulation - prev.accumulation)
      .map(item => {
        item.accumulation = item.accumulation.toFixed(2)
        return item
      })

    return {
      list,
      income: list.length > 0 ? income.toFixed(2) : null,
      expend: list.length > 0 ? expend.toFixed(2) : null,
      total: list.length > 0 ? total.toFixed(2) : null,
    }

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
