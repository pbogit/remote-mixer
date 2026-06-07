import { DeviceMessage } from '@remote-mixer/types'
import { OSC } from 'osc'

import {
  colorConverter,
  data2Fader,
  data2Id,
  DataConverter,
  faderConverter,
  id2Data,
  nameConverter,
  onConverter,
} from './converters'

const categoryByPrefix: { [prefix: string]: string } = {
  '/ch/': 'ch',
  '/rtn/': 'rtn',
  '/bus/': 'bus',
  '/dca/': 'dca',
  '/lr': 'lr',
}

const globalCategories = new Set(['lr'])
// XR18 uses no leading zeros for bus, dca, rtn, lr
const categoriesWithoutPadding = new Set(['dca', 'bus', 'rtn', 'lr'])

function simpleMapping(
  suffix: string,
  property: string,
  converter: DataConverter
): MessageMapping {
  return {
    incoming: message => {
      if (!message.address.endsWith(suffix)) return null

      for (const [prefix, category] of Object.entries(categoryByPrefix)) {
        if (message.address.startsWith(prefix)) {
          const id = globalCategories.has(category)
            ? '1'
            : data2Id(message.address.slice(prefix.length, prefix.length + 2))

          const value = converter.incoming(message.args[0])
          return {
            type: 'change',
            category,
            id,
            property,
            value,
          }
        }
      }

      return null
    },
    outgoing: (category, id, p, value) => {
      if (p !== property) return null

      for (const [prefix, c] of Object.entries(categoryByPrefix)) {
        if (c === category) {
          const idData = globalCategories.has(category)
            ? ''
            : categoriesWithoutPadding.has(category)
              ? id
              : id2Data(id)
          const address = prefix + idData + suffix
          return {
            address,
            args: value !== undefined ? [converter.outgoing(value)] : [],
          }
        }
      }

      return null
    },
  }
}

interface MessageMapping {
  incoming(message: OSC.Message): DeviceMessage | true | null
  outgoing?(
    category: string,
    id: string,
    property: string,
    value?: unknown
  ): OSC.Message | true | null
}

export const messageMapping: MessageMapping[] = [
  // fader (channels, rtn, bus, lr)
  simpleMapping('/mix/fader', 'value', faderConverter),

  // DCA fader — XR18 uses /dca/N/fader instead of /dca/N/mix/fader
  {
    incoming: message => {
      const match = message.address.match(/^\/dca\/(\d+)\/fader$/)
      if (!match) return null
      return {
        type: 'change',
        category: 'dca',
        id: String(parseInt(match[1])),
        property: 'value',
        value: faderConverter.incoming(message.args[0]),
      }
    },
    outgoing: (category, id, property, value) => {
      if (category !== 'dca' || property !== 'value') return null
      return {
        address: `/dca/${id}/fader`,
        args: value !== undefined ? [faderConverter.outgoing(value)] : [],
      }
    },
  },

  // on (channels, rtn, bus, lr)
  simpleMapping('/mix/on', 'on', onConverter),

  // DCA on — XR18 uses /dca/N/on instead of /dca/N/mix/on
  {
    incoming: message => {
      const match = message.address.match(/^\/dca\/(\d+)\/on$/)
      if (!match) return null
      return {
        type: 'change',
        category: 'dca',
        id: String(parseInt(match[1])),
        property: 'on',
        value: onConverter.incoming(message.args[0]),
      }
    },
    outgoing: (category, id, property, value) => {
      if (category !== 'dca' || property !== 'on') return null
      return {
        address: `/dca/${id}/on`,
        args: value !== undefined ? [onConverter.outgoing(value)] : [],
      }
    },
  },

  // name
  simpleMapping('/config/name', 'name', nameConverter),

  // color
  simpleMapping('/config/color', 'color', colorConverter),

  // mix sends (bus sends per channel)
  {
    incoming: message => {
      const match = message.address.match(/\/mix\/(\d+)\/level$/)
      if (!match) return null

      for (const [prefix, category] of Object.entries(categoryByPrefix)) {
        if (message.address.startsWith(prefix)) {
          const id = globalCategories.has(category)
            ? '1'
            : data2Id(message.address.slice(prefix.length, prefix.length + 2))

          const value = faderConverter.incoming(message.args[0])
          return {
            type: 'change',
            category,
            id,
            property: 'mix' + data2Id(match[1]),
            value,
          }
        }
      }

      return null
    },
    outgoing: (category, id, p, value) => {
      if (!p.startsWith('mix')) return null

      for (const [prefix, c] of Object.entries(categoryByPrefix)) {
        if (c === category) {
          const idData = globalCategories.has(category)
            ? ''
            : categoriesWithoutPadding.has(category)
              ? id
              : id2Data(id)
          const mix = id2Data(p.slice(3))
          const address = prefix + idData + '/mix/' + mix + '/level'
          return {
            address,
            args: value !== undefined ? [faderConverter.outgoing(value)] : [],
          }
        }
      }

      return null
    },
  },

  // meters — XR18 uses /meters/1 for input channels
  {
    incoming: message => {
      if (message.address !== '/meters/1') return null

      const data = Buffer.from(message.args[0])

      const outMessage: DeviceMessage = {
        type: 'meters',
        meters: {},
      }

      // offset 4: first int (byte length) is cut off by osc.js
      const dataOffset = 4

      for (let channel = 1; channel <= 16; channel++) {
        if (data.length < dataOffset + channel * 4) break

        outMessage.meters[`ch${channel}`] = data2Fader(
          data.readFloatLE(dataOffset + (channel - 1) * 4)
        )
      }

      // FX returns follow immediately after the 16 input channels
      const rtnOffset = dataOffset + 16 * 4

      for (let rtn = 1; rtn <= 4; rtn++) {
        if (data.length < rtnOffset + rtn * 4) break

        outMessage.meters[`rtn${rtn}`] = data2Fader(
          data.readFloatLE(rtnOffset + (rtn - 1) * 4)
        )
      }

      return outMessage
    },
  },
]
