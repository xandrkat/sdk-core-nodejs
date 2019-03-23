import { IContext, INetworkMutation, IConnectArgs } from '../../@types'

export const networkMutation = () => ({
  async connect (parent: any, args: IConnectArgs, { wifi }: IContext): Promise<boolean> {
    const v = await wifi.connect({ ssid: args.ssid, password: args.password })
    return true
  }
})
