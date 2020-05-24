const { valiAssert }  = require('../util')

const handler = async (ctx, next) => {
  const { id: idStr } = ctx.parsedQuery
  const id = await ctx.db.hget('bill:idstr-id-hash', idStr)
  const recordKey = 'bill:' + id
  const billInfo = await ctx.db.hgetall(recordKey)
  const { time } = billInfo || {}

  valiAssert(billInfo, 'value', '400; 账单不存在')

  valiAssert(await ctx.db.lrem('bill:id-list', 1, id), 'value === 1', '500; 账单不存在')
  valiAssert(await ctx.db.del(recordKey), 'value === 1', '501; 账单不存在')
  valiAssert(await ctx.db.zrem('bill:month-time_key-zset', time + '_' + recordKey), 'value === 1', '502; 账单不存在')
  valiAssert(await ctx.db.zrem('bill:timestamp-key-zset', recordKey), 'value === 1', '503; 账单不存在')
  valiAssert(await ctx.db.zrem('bill:categoryid-time_key-zset', time + '_' + recordKey), 'value === 1', '504; 账单不存在')
  valiAssert(await ctx.db.hdel('bill:idstr-id-hash', idStr), 'value === 1', '505; 账单不存在')

  ctx.status = 200
  ctx.body = {
    code: 200,
    data: '删除成功',
  }
}

module.exports = async (ctx, next) => await handler(ctx, next)
