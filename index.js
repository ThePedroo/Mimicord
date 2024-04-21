import http from 'node:http'
import { URL } from 'node:url'

import WebSocketServer from '@performanc/pwsl-server'
import verifyParams from '@performanc/pctl'

/*
  TODO: Implement test case for max_concurrency exceeded in Gateway Identifying
*/

const DiscordUser = {
  id: 1000000000000000,
  username: 'Concord',
  discriminator: '0001',
  global_name: 'ConcordGlobal',
  avatar: 'ConcordAvatar'.toString('base64'),
  bot: false,
  system: false,
  mfa_enabled: false,
  banner: 'ConcordBanner'.toString('base64'),
  accent_color: 0,
  locale: 'pt-BR',
  verified: true,
  email: 'concord@concord.com',
  flags: 0 | (1 << 0),
  premium_type: 0,
  public_flags: 0 | (1 << 0),
  avatar_decorations: 'ConcordAvatarDecorations'.toString('base64'),
}

const DiscordUnavailableGuild = {
  id: 1000000000000001,
  unavailable: true
}

// https://discord.com/developers/docs/resources/application#application-object
const Application = {
  id: 1000000000000002,
  flags: 0,
  // TODO: implement the rest of the fields
}

const DiscordMessage = {
  id: 1000000000000003,
  channel_id: 1000000000000004,
  author: DiscordUser,
  content: 'Concord message content',
  timestamp: new Date().toISOString(),
  edited_timestamp: null,
  tts: false,
  mention_everyone: false,
  mentions: [],
  mention_roles: [],
  mention_channels: [],
  attachments: [],
  embeds: [],
  reactions: [],
  nonce: 0,
  pinned: false,
  webhook_id: null,
  type: 0,
  activity: null,
  application: null,
  application_id: null,
  message_reference: null,
  flags: 0,
  referenced_message: null,
  interaction_metadata: null,
  interaction: null,
  thread: null,
  components: [],
  sticker_items: [],
  stickers: [],
  position: 0,
  role_subscription_data: null,
  resolved: null,
  poll: null
}

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
        const checks = {
          'token': {
            type: 'string',
            extraVerification: (param) => {
              if (!param.startsWith('MTA')) {
                console.error('Failed to identify with Discord at Identify stage.')

                process.exit(1)
              }

              /* Fine */
            }
          },
          'properties': {
            type: 'object',
            params: {
              'os': {
                type: 'string',
                extraVerification: (param) => {
                  if (param !== 'GNU/Linux') {
                    console.error('Invalid OS at Identify stage.')

                    process.exit(1)
                  }

                  /* Fine */
                },
              },
              'browser': {
                type: 'string',
                extraVerification: (param) => {
                  if (param !== 'concord') {
                    console.error('Invalid browser at Identify stage.')

                    process.exit(1)
                  }

                  /* Fine */
                }
              },
              'device': {
                type: 'string',
                extraVerification: (param) => {
                  if (param !== 'concord') {
                    console.error('Invalid device at Identify stage.')

                    process.exit(1)
                  }

                  /* Fine */
                }
              }
            }
          },
          'compress': {
            type: 'boolean',
            required: false
          },
          'large_threshold': {
            type: 'number',
            required: false
          },
          'shard': {
            /* TODO: improve PCTL to support string arrays */
            required: false
          },
          'presence': {
            type: 'object',
            params: {
              'since': {
                type: 'string',
                extraVerification: (param) => {
                  if (Date.parse(param) === NaN) {
                    console.error('Invalid since at Identify stage.')

                    process.exit(1)
                  }

                  /* Fine */
                }
              },
              'activities': {
                type: 'array',
                params: {
                  'name': {
                    type: 'string'
                  },
                  'type': {
                    type: 'number'
                  }
                },
                required: false
              },
              'status': {
                type: 'string',
                extraVerification: (param) => {
                  if (param !== 'online') {
                    console.error('Invalid status at Identify stage.')

                    process.exit(1)
                  }

                  /* Fine */
                }
              },
              'afk': {
                type: 'boolean'
              }
            },
            required: false
          },
          'intents': {
            type: 'string',
            extraVerification: (param) => {
              if (Number(param) === NaN) {
                console.error('Invalid intents at Identify stage.')

                process.exit(1)
              }

              /* Fine */
            }
          }
        }
      
        verifyParams(checks, payload.d)

        if (!payload.d.token.startsWith('MTA')) {
          console.error('Failed to identify with Discord at Identify stage.')

          process.exit(1)
        }

        ws.send(JSON.stringify({
          t: 'READY',
          s: ws.s++,
          op: 0,
          d: {
            v: 10,
            user: DiscordUser,
            guilds: [ DiscordUnavailableGuild ],
            session_id: 'ConcordSessionID',
            resume_gateway_url: 'ws://localhost:8080/resume',
            shard: payload.d.shard,
            application: {
              id: Application.id,
              flags: Application.flags
            }
          }
        }))

        setTimeout(() => {
          ws.send(JSON.stringify({
            t: 'MESSAGE_CREATE',
            s: ws.s++,
            op: 0,
            d: DiscordMessage
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