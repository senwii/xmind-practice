const fs = require('fs')
const CSVParse = require('csv-parse')
const { promisify } = require('util')

/**
 * 部分client方法promisify
 * @param {*} client 
 * @returns client
 */
function wrapClientWithPromise(client) {
  function override(client, keys) {
    keys.map(key => {
      const origin = client[key]

      client[key] = promisify(origin).bind(client)
    })

    return client
  }

  const keySet = [
    'get', 'set', 'setnx', 'getset', 'del', 'expire', 'exists', 'exec', 'incr',
    'hget', 'hset', 'hdel', 'hincrby', 'hgetall', 'hexists',
    'llen', 'lrem', 'lrange', 'rpush',
    'zadd', 'zrange', 'zrem', 'zrangebyscore',
    'sadd',
  ]

  override(client, keySet)

  const cmulti = client.multi

  client.multi = (...params) => {
    const inst = cmulti.bind(client)(...params)

    return override(inst, keySet)
  }

  return client
}

/**
 * 加载.csv到数据库
 * @param {*} client 
 * @param {*} filepath 
 * @param {*} prefix 
 * @param {x} predeal 
 * @param {*} rowitemcb 
 */
async function initDbFromCSV(client, filepath, prefix, predeal, rowitemcb) {
  const idListKey = prefix + 'id-list'
  const readFile = promisify(fs.readFile).bind(fs)
  const parser = promisify(CSVParse).bind(CSVParse)

  const data = await readFile(filepath, 'utf8')
  let rowList = (await parser(data, {
    delimiter: ',',
    columns: true,
  })) || []

  predeal && (rowList = predeal(rowList))

  return await new Promise((resolve, reject) => {
    try {
      const length = rowList.length
      rowList.reduce(async (acc, rowitem, rowindex) => {
        await acc
        const id = (Number((await client.lrange(idListKey, -1, -1))[0]) || 0) + 1
        const multi = client.multi()
        const recordKey = prefix + id

        multi.rpush(idListKey, id)

        Object.entries(rowitem).map(([key, value]) => {
          multi.hset(recordKey, key, value)
        })
        rowitemcb && await rowitemcb(id, rowitem, multi)
        multi.exec()

        if (rowindex === length - 1) {
          resolve()
        }
      }, null)
    } catch(err) {
      reject(err)
    }
  })
}

module.exports = {
  wrapClientWithPromise,
  initDbFromCSV,
}
