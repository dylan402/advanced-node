import { FacebookAccount } from '@/domain/models'

const facebookData = {
  facebookId: 'any_facebook_facebookId',
  name: 'any_facebook_name',
  email: 'any_facebook_email'
}

describe('FacebookAccount', () => {
  it('should create with facebook data only', () => {
    const sut = new FacebookAccount(facebookData)

    expect(sut).toEqual(facebookData)
  })

  it('should update name if its empty', () => {
    const accountData = { id: 'any_id' }
    const sut = new FacebookAccount(facebookData, accountData)

    expect(sut).toEqual({ ...facebookData, ...accountData })
  })

  it('should not update name if its not empty', () => {
    const accountData = { id: 'any_id', name: 'any_name' }
    const sut = new FacebookAccount(facebookData, accountData)

    expect(sut).toEqual({
      id: 'any_id',
      facebookId: 'any_facebook_facebookId',
      name: 'any_name',
      email: 'any_facebook_email'
    })
  })
})
