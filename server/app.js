const Koa = require('koa')
const ip = require('ip')
const bodyarser = require('koa-bodyparser')
const helmet = require('koa-helmet')
const toobusy = require('koa-toobusy')
const chalk = require('chalk')

const router = require('./src/api')
const { client } = require('./src/db')

const app = new Koa()

app.context.db = client

app.use(async (ctx, next) => {
  return next().catch(err => {
    let [code, message] = err.message.split(';')

    code = +code || 500
    message = message || '服务器处理时发生错误'

    console.log(err)

    ctx.status = code
    ctx.body = {
      code,
      error: message.trim(),
    }
  })
})

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(chalk.gray(`${ctx.method} ${ctx.url} ${ctx.status} ${ctx.message} - ${ms}ms`))
})

app.use(async (ctx, next) => {
  let userIp = ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'] || ctx.ip
  userIp = userIp.split(',')[0].trim()

  if (ip.isPrivate(userIp)) {
    return await next()
  } else {
    ctx.status = 403
    ctx.body = {
      code: 403,
      error: '禁止访问',
    }
  }
})

app.use(bodyarser())

app.use(helmet())

app.use(toobusy({
  maxLag: 20,
}))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8085)
