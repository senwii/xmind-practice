const handler = async (ctx, next) => {
  const cateIdMap = await ctx.db.hgetall('category:idstr-id-hash')
  const responseData = await Object.values(cateIdMap).reduce(async (memo, categoryId) => {
    const categoryData = await ctx.db.hgetall('category:' + categoryId)
    const { id, type, name } = categoryData

    memo = await memo
    memo.push({
      id,
      type: Number(type),
      name,
    })

    return memo
  }, [])

  ctx.status = 200
  ctx.body = {
    code: 200,
    data: responseData,
  }
}

module.exports = async (ctx, next) => await handler(ctx, next)
