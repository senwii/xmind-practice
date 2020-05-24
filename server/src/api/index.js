const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const Router = require('@koa/router')
const chalk = require('chalk')
const router = new Router()

fs.stat = promisify(fs.stat).bind(fs)

// 当前目录下文件夹视为路由文件夹，
// 遍历获取路由配置，
// 要求每个文件夹下包含index.js，导出对应路由配置。
// 参考./getBillList/index.js
fs.readdir(__dirname, async (err, files) => {
  if (err) {
    console.log(chalk.red(err.stack))
    return
  }
  const routeDirs = await files.reduce(async (memo, file) => {
    const filepath = path.resolve(__dirname, file)
    const stat = await fs.stat(filepath)

    if (stat.isDirectory()) {
      memo = await memo
      memo.push(filepath)
    }

    return memo
  }, [])

  // 生成路由，挂载到router上
  routeDirs.map(dirpath => {
    const routeConfig = require(path.resolve(dirpath))
    createRoute(router, routeConfig)
  })
})

/**
 * 从配置对象生成路由，并挂载到router
 * @param {*} router 
 * @param {*} routeConfig 
 */
function createRoute(router, routeConfig) {
  const { route, method='get', params={}, controller } = routeConfig

  router[method.toLowerCase()](route, async (ctx, next) => {
    const queryData = {
      ...ctx.query,
      ...ctx.request.body,
    }
    const parsedQuery = Object.entries(params).reduce((memo, [pattern, parser]) => {

      const optional = pattern.match(/\?$/) !== null
      const paramkey = optional ? pattern.slice(0, -1) : pattern
      const paramval = queryData[paramkey]

      try {
        if (optional) {
          if (paramval !== undefined) {
            memo[paramkey] = parser(paramval)
          }
        } else {
          memo[paramkey] = parser(paramval)
        }
      } catch(err) {
        throw err
      }

      return memo
    }, {})

    // 解析过的参数存入ctx.parsedQuery
    ctx.parsedQuery = parsedQuery

    await controller(ctx, next)
  })

  return router
}

module.exports = router
