export interface Params {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: NonNullable<any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function constructParams(args: { [index: string]: any }): Params {
  const params: Params = {}
  for (const a in args) {
    if (Object.prototype.hasOwnProperty.call(args, a)) {
      const prop = args[a]
      if (prop) {
        params[a] = prop
      }
    }
  }
  return params
}
exports.constructParams = constructParams
