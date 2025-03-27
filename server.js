const http = require('http')
const httpProxy = require('http-proxy')
require('dotenv').config()

const GPT_API_BACKEND = process.env.GPT_API_BACKEND

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true, // 支持 WebSocket 代理
})

// 处理错误
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err)
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
  }
  res.end('Proxy encountered an error')
})

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const target = GPT_API_BACKEND // 目标服务器

  console.log(`Proxying request: ${req.method} ${req.url} -> ${target}`)

  // 设置 CORS 头部，允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  proxy.web(req, res, {
    target: target,
    selfHandleResponse: false,
  })
})

// 监听端口
const PORT = 3000
server.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`)
})
