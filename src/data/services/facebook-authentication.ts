import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { CreateFacebookAccountRepository, LoadUserAccountRepository } from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'

export class FacebookAuthenticationService {
  constructor (private readonly facebookUserApi: LoadFacebookUserApi, private readonly userAccountRepository: LoadUserAccountRepository & CreateFacebookAccountRepository) {}

  async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookData = await this.facebookUserApi.loadUser(params)

    if (facebookData) {
      await this.userAccountRepository.load({ email: facebookData.email })
      await this.userAccountRepository.createFromFacebook(facebookData)
    }
    return new AuthenticationError()
  }
}
