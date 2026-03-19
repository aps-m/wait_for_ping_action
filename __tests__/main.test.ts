import * as core from '@actions/core'
import * as ping from 'ping'
import * as main from '../src/main'
import * as waitModule from '../src/wait'

jest.mock('ping', () => ({
  promise: {
    probe: jest.fn()
  }
}))

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let waitMock: jest.SpiedFunction<typeof waitModule.wait>

const pingPromiseMock = jest.mocked(ping.promise)

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    waitMock = jest.spyOn(waitModule, 'wait').mockResolvedValue('done!')
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  it('passes when host becomes pingable', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'tries':
          return '3'
        case 'host':
          return 'localhost'
        default:
          return ''
      }
    })
    pingPromiseMock.probe
      .mockResolvedValueOnce({ alive: false } as ping.PingResponse)
      .mockResolvedValueOnce({ alive: true } as ping.PingResponse)

    await main.run()
    expect(runMock).toHaveReturned()

    expect(pingPromiseMock.probe.mock.calls).toHaveLength(2)
    expect(pingPromiseMock.probe.mock.calls[0]).toEqual(['localhost'])
    expect(pingPromiseMock.probe.mock.calls[1]).toEqual(['localhost'])
    expect(waitMock).toHaveBeenCalledTimes(1)
    expect(waitMock).toHaveBeenCalledWith(1000)
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status when all ping attempts fail', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'tries':
          return '2'
        case 'host':
          return 'localhost'
        default:
          return ''
      }
    })
    pingPromiseMock.probe.mockResolvedValue({
      alive: false
    } as ping.PingResponse)

    await main.run()
    expect(runMock).toHaveReturned()

    expect(pingPromiseMock.probe.mock.calls).toHaveLength(2)
    expect(waitMock).toHaveBeenCalledTimes(2)
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'All attempts failed')
    expect(errorMock).not.toHaveBeenCalled()
  })
})
