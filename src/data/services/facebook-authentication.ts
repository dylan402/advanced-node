import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { FacebookAccount } from '@/domain/models'

export class FacebookAuthenticationService {
  constructor (private readonly facebookUserApi: LoadFacebookUserApi, private readonly userAccountRepository: LoadUserAccountRepository & SaveFacebookAccountRepository) {}

  async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookData = await this.facebookUserApi.loadUser(params)

    if (facebookData) {
      const accountData = await this.userAccountRepository.load({ email: facebookData.email })
      const facebookAccount = new FacebookAccount(facebookData, accountData)
      await this.userAccountRepository.saveWithFacebook(facebookAccount)
    }
    return new AuthenticationError()
  }
}
