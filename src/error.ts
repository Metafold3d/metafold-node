/** Error on job timeout. */
export class PollTimeout extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...params: any[]) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PollTimeout)
    }

    this.name = "PollTimeout"
  }
}
