import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'

export class FacebookAuthenticationService {
  constructor (private readonly facebookUserApi: LoadFacebookUserApi, private readonly userAccountRepository: LoadUserAccountRepository & SaveFacebookAccountRepository) {}

  async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookData = await this.facebookUserApi.loadUser(params)

    if (facebookData) {
      const accountData = await this.userAccountRepository.load({ email: facebookData.email })

      await this.userAccountRepository.saveWithFacebook({
        id: accountData?.id,
        facebookId: facebookData.facebookId,
        name: accountData?.name ?? facebookData.name,
        email: facebookData.email
      })
    }
    return new AuthenticationError()
  }
}
