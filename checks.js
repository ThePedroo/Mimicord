const identifyCheck = {
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

export default {
  identifyCheck
}