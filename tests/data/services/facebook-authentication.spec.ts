import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { TokenGenerator } from '@/data/contracts/crypto'
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from '@/data/contracts/repos'
import { FacebookAuthenticationService } from '@/data/services/facebook-authentication'
import { AuthenticationError } from '@/domain/errors'
import { AccessToken, FacebookAccount } from '@/domain/models'

import { mock, MockProxy } from 'jest-mock-extended'

jest.mock('@/domain/models/facebook-account')

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService
  let facebookUserApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepository: MockProxy<LoadUserAccountRepository & SaveFacebookAccountRepository>
  let crypto: MockProxy<TokenGenerator>
  let token: string

  beforeAll(() => {
    token = 'any_token'
    facebookUserApi = mock()
    userAccountRepository = mock()
    crypto = mock()

    facebookUserApi.loadUser.mockResolvedValue({ facebookId: 'any_facebook_id', name: 'any_facebook_name', email: 'any_facebook_email' })
    userAccountRepository.load.mockResolvedValue({ id: 'any_id', name: 'any_name' })
    userAccountRepository.saveWithFacebook.mockResolvedValue({ id: 'any_id' })
    crypto.generateToken.mockResolvedValue('any_generated_token')
  })

  beforeEach(() => {
    sut = new FacebookAuthenticationService(facebookUserApi, userAccountRepository, crypto)
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

  it('should call SaveFacebookAccountRepository with FacebookAccount', async () => {
    const FacebookAccountStub = jest.fn().mockImplementation(() => ({ any: 'any' }))
    jest.mocked(FacebookAccount).mockImplementationOnce(FacebookAccountStub)

    await sut.perform({ token })

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({ any: 'any' })
    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1)
  })

  it('should call TokenGenerator with correct params', async () => {
    await sut.perform({ token })

    expect(crypto.generateToken).toHaveBeenCalledWith({
      key: 'any_id',
      expirationInMs: AccessToken.expirationInMs
    })
    expect(crypto.generateToken).toHaveBeenCalledTimes(1)
  })

  it('should return an AccessToken on success', async () => {
    const authResult = await sut.perform({ token })

    expect(authResult).toEqual(new AccessToken('any_generated_token'))
  })

  it('should rethrow if LoadFacebookUserApi throws', async () => {
    facebookUserApi.loadUser.mockRejectedValueOnce(new Error())

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error())
  })

  it('should rethrow if LoadUserAccountRepository throws', async () => {
    userAccountRepository.load.mockRejectedValueOnce(new Error())

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error())
  })

  it('should rethrow if SaveFacebookAccountRepository throws', async () => {
    userAccountRepository.saveWithFacebook.mockRejectedValueOnce(new Error())

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error())
  })
})
