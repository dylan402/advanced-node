import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from '@/data/contracts/repos'
import { FacebookAuthenticationService } from '@/data/services/facebook-authentication'
import { AuthenticationError } from '@/domain/errors'

import { mock, MockProxy } from 'jest-mock-extended'

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService
  let facebookUserApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepository: MockProxy<LoadUserAccountRepository & SaveFacebookAccountRepository>
  const token = 'any_token'

  beforeEach(() => {
    facebookUserApi = mock()
    facebookUserApi.loadUser.mockResolvedValue({
      facebookId: 'any_facebook_id',
      name: 'any_facebook_name',
      email: 'any_facebook_email'
    })
    userAccountRepository = mock()
    userAccountRepository.load.mockResolvedValue({
      id: 'any_id',
      name: 'any_name'
    })
    sut = new FacebookAuthenticationService(facebookUserApi, userAccountRepository)
  })

  it('should call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })

    expect(facebookUserApi.loadUser).toHaveBeenCalledWith({ token })
    expect(facebookUserApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    facebookUserApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.perform({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.perform({ token })

    expect(userAccountRepository.load).toHaveBeenCalledWith({ email: 'any_facebook_email' })
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1)
  })

  it('should call create account with facebook data', async () => {
    userAccountRepository.load.mockResolvedValueOnce(undefined)
    await sut.perform({ token })

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      facebookId: 'any_facebook_id',
      name: 'any_facebook_name',
      email: 'any_facebook_email'
    })
    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1)
  })

  it('shoudl not update account name', async () => {
    await sut.perform({ token })

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      facebookId: 'any_facebook_id',
      name: 'any_name',
      email: 'any_facebook_email'
    })
    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1)
  })

  it('should update account name', async () => {
    userAccountRepository.load.mockResolvedValueOnce({ id: 'any_id' })
    await sut.perform({ token })

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      facebookId: 'any_facebook_id',
      name: 'any_facebook_name',
      email: 'any_facebook_email'
    })
    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1)
  })
})
