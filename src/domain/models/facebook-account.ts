type FacebookModel = {
  facebookId: string
  name: string
  email: string
}

type AccountModel = {
  id?: string
  name?: string
}

export class FacebookAccount {
  id?: string
  name: string
  email: string
  facebookId: string

  constructor (facebookModel: FacebookModel, accountModel?: AccountModel) {
    this.id = accountModel?.id
    this.facebookId = facebookModel.facebookId
    this.name = accountModel?.name ?? facebookModel.name
    this.email = facebookModel.email
  }
}
