const { valiAssert, addLockUntilAvailable }  = require('../util')
const { abstract } = require('../../../util')

const handler = async (ctx, next) => {
  const { time, category, amount } = ctx.parsedQuery
  const categoryId = await ctx.db.hget('category:idstr-id-hash', category)
  const categoryInfo = await ctx.db.hgetall('category:' + categoryId)

  valiAssert(categoryId, 'value', '400; 类目不存在')
  valiAssert(categoryInfo, 'value', '400; 类目不存在')

  const deleteLock = await addLockUntilAvailable(ctx, 'bill:add-lock')

  const month = new Date(time).getMonth() + 1
  const id = (Number((await ctx.db.lrange('bill:id-list', -1, -1))[0]) || 0) + 1
  const idStr = await abstract(() => String(id + Math.random()), 10, async hash => {
    return await ctx.db.hexists('bill:idstr-id-hash', hash) === 0
  })
  const recordKey = 'bill:' + id
  const multi = ctx.db.multi()

  multi.rpush('bill:id-list', id)

  multi.hset(recordKey, 'id', idStr)
  multi.hset(recordKey, 'type', categoryInfo.type)
  multi.hset(recordKey, 'time', time)
  multi.hset(recordKey, 'category', category)
  multi.hset(recordKey, 'amount', amount)
  multi.hset(recordKey, 'categoryName', categoryInfo.name)

  multi.hset('bill:idstr-id-hash', idStr, id)
  multi.zadd('bill:month-time_key-zset', month, time + '_' + recordKey)
  multi.zadd('bill:timestamp-key-zset', time, recordKey)
  multi.zadd('bill:categoryid-time_key-zset', categoryId, time + '_' + recordKey)
  multi.exec()

  ctx.status = 200
  ctx.body = {
    code: 200,
    data: '添加成功',
  }

  await deleteLock()
}

module.exports = async (ctx, next) => await handler(ctx, next)
