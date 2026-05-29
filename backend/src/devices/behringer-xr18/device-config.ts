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
        ...arrayRange(1, 16, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
      modes: ['full', 'iem'],
    },
    {
      key: 'auxin',
      label: 'AUX In',
      count: 2,
      meters: true,
      namePrefix: 'A',
      additionalProperties: ['on'],
      faderProperties: [
        { key: 'value', label: 'AUX' },
        ...arrayRange(1, 16, it => ({ key: 'mix' + it, label: 'MIX' + it })),
      ],
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
