import * as core from '@actions/core'
import { wait } from './wait'
import * as ping from 'ping'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const tries: number = Number(core.getInput('tries'))
    const host: string = core.getInput('host')

    async function advancedPing(host: string, tries: number): Promise<boolean> {
      let timeOutHandle: NodeJS.Timeout

      return new Promise((resolve, reject) => {
        timeOutHandle = setTimeout(() => {
          reject(new Error('Timeout exceeded'))
        }, tries * 1000)
        ;(async () => {
          try {
            for (let i = 0; i < tries; i++) {
              const result = await ping.promise.probe(host)

              if (result.alive) {
                clearTimeout(timeOutHandle)
                resolve(true)
                return
              }
              await wait(1000)
            }

            clearTimeout(timeOutHandle)
            reject(new Error('All attempts failed'))
          } catch (error) {
            clearTimeout(timeOutHandle)
            reject(error)
          }
        })()
      })
    }

    advancedPing(host, tries)
      .then(() => {
        console.log('Ping successful!')
      })
      .catch(error => {
        console.error(`Ping failed, error: ${error.message}`)
        core.setFailed(error.message)
      })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
