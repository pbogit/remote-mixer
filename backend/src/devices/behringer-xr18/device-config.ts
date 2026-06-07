import { DeviceConfiguration } from '@remote-mixer/types'
import { arrayRange } from '@remote-mixer/utils'

export const deviceConfig: DeviceConfiguration = {
  categories: [
    {
      key: 'ch',
      label: 'Channels',
      count: 16,
      meters: true,
      namePrefix: 'CH',
      additionalProperties: ['on'],
      faderProperties: [
        { key: 'value', label: 'CH' },
        ...arrayRange(1, 6, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
      modes: ['full', 'iem'],
    },
    {
      key: 'rtn',
      label: 'FX Returns',
      count: 4,
      meters: true,
      namePrefix: 'FX',
      additionalProperties: ['on'],
      faderProperties: [
        { key: 'value', label: 'RTN' },
        ...arrayRange(1, 6, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
      modes: ['full'],
    },
    {
      key: 'bus',
      label: 'Bus',
      count: 6,
      namePrefix: 'BUS',
      additionalProperties: ['on'],
      faderProperties: [
        { key: 'value', label: 'BUS' },
        ...arrayRange(1, 6, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
      modes: ['full'],
    },
    {
      key: 'dca',
      label: 'DCA',
      count: 4,
      namePrefix: 'DCA',
      additionalProperties: ['on'],
      modes: ['full'],
    },
    {
      key: 'lr',
      label: 'LR',
      count: 1,
      namePrefix: 'LR',
      additionalProperties: ['on'],
      faderProperties: [
        { key: 'value', label: 'LR' },
        ...arrayRange(1, 6, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
      modes: ['full'],
    },
  ],
  colors: [
    '#f00',
    '#0f0',
    '#ff0',
    '#00f',
    '#f0f',
    '#0ff',
    '#fff',
    // inverted
    '#444',
    '#f88',
    '#7f7',
    '#ff7',
    '#77f',
    '#f7f',
    '#7ff',
    '#bbb',
  ],
}
