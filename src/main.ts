import * as core from '@actions/core'
import { wait } from './wait'
import * as ping from 'ping'

async function advancedPing(
  targetHost: string,
  maxTries: number
): Promise<boolean> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  try {
    return await new Promise((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error('Timeout exceeded'))
      }, maxTries * 1000)

      void (async () => {
        try {
          for (let index = 0; index < maxTries; index++) {
            const result = await ping.promise.probe(targetHost)

            if (result.alive) {
              resolve(true)
              return
            }

            await wait(1000)
          }

          reject(new Error('All attempts failed'))
        } catch (error) {
          reject(error)
        }
      })()
    })
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const tries = Number(core.getInput('tries'))
    const host = core.getInput('host')

    await advancedPing(host, tries)
    console.log('Ping successful!')
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Ping failed, error: ${error.message}`)
      core.setFailed(error.message)
    }
  }
}
