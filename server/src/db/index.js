const redis = require('redis')
const assert = require('assert')
const chalk = require('chalk')
const CWD = process.cwd()

const { wrapClientWithPromise, initDbFromCSV } = require('./util')
const { abstract } = require('../../util')

const NAMESPACE = 'xmind-practice:'
const BILL_PREFIX = 'bill:'
const CATEGORY_PREFIX = 'category:'
const BILL_ID_LIST_KEY = BILL_PREFIX + 'id-list'
const CATEGORY_ID_LIST_KEY = CATEGORY_PREFIX + 'id-list'

const client = wrapClientWithPromise(redis.createClient('redis://localhost:6379', {
  prefix: NAMESPACE,
  // password: '******', // 数据库密码
}))

client.on('error', err => {
  assert.equal(err)
  client.save(redis.print)
})

client.on('ready', async () => {
  const IS_FIRST_RUN = ((await client.llen(BILL_ID_LIST_KEY)) === 0) && ((await client.llen(CATEGORY_ID_LIST_KEY)) === 0)

  // 首次加载.csv
  if (IS_FIRST_RUN) {
    // 先加载categories.csv
    await initDbFromCSV(client, `${CWD}/task/categories.csv`, CATEGORY_PREFIX, null, (id, itemData) => {
      const idStr = itemData.id

      client.hset(CATEGORY_PREFIX + 'idstr-id-hash', idStr, id)
    })

    await initDbFromCSV(client, `${CWD}/task/bill.csv`, BILL_PREFIX, data => data
      .map(item => {
        item.time = Number(item.time)
        return item
      })
      .sort((prev, next) => prev.time - next.time)
    , async(id, itemData, multi) => {
      const timestamp = Number(itemData.time)
      const category = itemData.category
      const month = new Date(timestamp).getMonth() + 1
      const categoryId = await client.hget(CATEGORY_PREFIX + 'idstr-id-hash', category)
      const categoryKey = CATEGORY_PREFIX + categoryId
      const categoryData = await client.hgetall(categoryKey)
      const idStr = await abstract(() => String(id + Math.random()), 10, async hash => {
        return await client.hexists(BILL_PREFIX + 'idstr-id-hash', hash) === 0
      })

      client.hset(BILL_PREFIX + 'idstr-id-hash', idStr, id)
      client.zadd(BILL_PREFIX + 'month-time_key-zset', month, timestamp + '_' + BILL_PREFIX + id)
      client.zadd(BILL_PREFIX + 'timestamp-key-zset', timestamp, BILL_PREFIX + id)
      client.zadd(BILL_PREFIX + 'categoryid-time_key-zset', categoryId, timestamp + '_' + BILL_PREFIX + id)
      multi.hset(BILL_PREFIX + id, 'id', idStr)
      multi.hset(BILL_PREFIX + id, 'categoryName', categoryData.name)
      multi.hset(BILL_PREFIX + id, 'amount', Math.abs(itemData.amount))
    })
  }

  console.log(chalk.green('\u{1f60e} redis is ready, initialized data loaded!'))
})

module.exports = {
  client,
  namespace: NAMESPACE,
}
