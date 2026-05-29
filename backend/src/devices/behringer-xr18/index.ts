import { DeviceController, DeviceMessageListener } from '@remote-mixer/types'
import { logger } from '@remote-mixer/utils'

import { delay } from '../../util/time'

import { connect, sendMessage, XR18Options } from './connection'
import { deviceConfig } from './device-config'
import {
  getChangeMessage,
  getMeterRequest,
  interpretIncomingMessage,
} from './protocol'
import { sync } from './sync'

export default class BehringerXR18DeviceController implements DeviceController {
  deviceConfig = deviceConfig

  constructor(
    private listener: DeviceMessageListener,
    options: XR18Options
  ) {
    connect(message => {
      const internalMessage = interpretIncomingMessage(message)
      if (internalMessage && typeof internalMessage === 'object') {
        this.listener(internalMessage)
      }

      if (message === null) {
        logger.debug('<== unhandled message', message)
      }
    }, options).then(async () => {
      await sync()

      await delay(200)

      sendMessage(getMeterRequest())

      setInterval(() => {
        sendMessage(getMeterRequest())
      }, 9000)
    })
  }

  change(category: string, id: string, property: string, value: unknown): void {
    const message = getChangeMessage(category, id, property, value)
    logger.debug(
      `==> change ${category} ${id} ${property} ${value} =>`,
      message
    )
    if (message) sendMessage(message)
  }

  sync(): void {
    logger.debug('==> synchronizing...')
    sync()
  }
}
