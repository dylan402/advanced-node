import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { CreateFacebookAccountRepository, LoadUserAccountRepository, UpdateFacebookAccountRepository } from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookUserApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository & CreateFacebookAccountRepository & UpdateFacebookAccountRepository
  ) {}

  async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookData = await this.facebookUserApi.loadUser(params)

    if (facebookData) {
      const accountData = await this.userAccountRepository.load({ email: facebookData.email })

      if (accountData) {
        await this.userAccountRepository.updateWithFacebook({
          id: accountData.id,
          facebookId: facebookData.facebookId,
          name: accountData.name ?? facebookData.name
        })
      } else {
        await this.userAccountRepository.createFromFacebook(facebookData)
      }
    }
    return new AuthenticationError()
  }
}
