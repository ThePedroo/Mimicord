import http from 'node:http'
import { URL } from 'node:url'

import WebSocketServer from '@performanc/pwsl-server'
import verifyParams from '@performanc/pctl'

import checks from './checks.js'
import structures from './structures.js'

/*
  TODO: Implement test case for max_concurrency exceeded in Gateway Identifying
*/

const server = http.createServer((req, res) => {
  res.writeHead(400)
  res.end('Invalid request.')
})
const WSServer = new WebSocketServer()

WSServer.on('/', async (ws) => {
  console.log('Concord connected to Mimicord.')

  ws.s = 0
  ws.hbTimeout = null

  /*
    Hello event

    https://discord.com/developers/docs/topics/gateway#hello-event
  */
  ws.send(JSON.stringify({
    op: 10,
    d: {
      heartbeat_interval: 45000
    }
  }))

  ws.on('message', (message) => {
    const payload = JSON.parse(message)

    switch (payload.op) {
      /*
        Heartbeat

        https://discord.com/developers/docs/topics/gateway-events#heartbeat-example-heartbeat
      */
      case 1: {
        console.log('Heartbeat received from Concord.')

        clearTimeout(ws.hbTimeout)
        ws.hbTimeout = setTimeout(() => {
          console.error('Heartbeat timeout.')

          process.exit(1)
        }, 45000 + 1000)

        ws.send(JSON.stringify({
          op: 11,
          d: payload.d
        }))

        break
      }
      /*
        Identify

        https://discord.com/developers/docs/topics/gateway#identifying-example-identify-payload
      */
      case 2: {
        console.log('Identifying with Concord.')

        verifyParams(checks.identifyCheck, payload.d)

        ws.send(JSON.stringify({
          t: 'READY',
          s: ws.s++,
          op: 0,
          d: {
            v: 10,
            user: structures.DiscordUser,
            guilds: [ structures.DiscordUnavailableGuild ],
            session_id: 'ConcordSessionID',
            resume_gateway_url: 'ws://localhost:8080/resume',
            shard: payload.d.shard,
            application: {
              id: structures.Application.id,
              flags: structures.Application.flags
            }
          }
        }))

        setTimeout(() => {
          ws.send(JSON.stringify({
            t: 'MESSAGE_CREATE',
            s: ws.s++,
            op: 0,
            d: structures.DiscordMessage
          }))
        }, 2000)

        ws.hbTimeout = setTimeout(() => {
          console.error('Heartbeat timeout.')

          process.exit(1)
        }, 45000 + 1000)

        break
      }
      default: {
        console.error('Unknown payload! ', payload)
        
        process.exit(1)
      }
    }
  })
})

server.on('upgrade', (req, socket, head) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  if (pathname === '/') {
    /* TODO: check for the queries */

    WSServer.handleUpgrade(req, socket, head, {}, (ws) => WSServer.emit('/', ws, req))
  }

  if (pathname === '/resume') {
    /* TODO: implement the resume */
  }
})

server.on('error', (err) => {
  console.log(`Error: ${err.message}`)
})

WSServer.on('error', (err) => {
  console.log(`Error: ${err.message}`)
})

server.listen(8080, () => {
  console.log(`Listening on port 8080.`)
})