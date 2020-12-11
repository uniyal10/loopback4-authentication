import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {toJSON} from '@loopback/testlab';
import {pick} from 'lodash';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {MyUserProfile} from '../types';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User,Credentials>{
  constructor(
    @repository(UserRepository)
    public userRepository :UserRepository,
    @inject('service.hasher')
    public hasher :BcryptHasher
  ){}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where:{
        email:credentials.email
      }
    })
    if(!foundUser){
      throw new HttpErrors.NotFound('user does not found with this  email')
    }
    const passwordMatched = await this.hasher.comparePassword(credentials.password,foundUser.password)

    if(!passwordMatched){
      throw new HttpErrors.Unauthorized('password not valid')

    }
    return foundUser
  }
  convertToUserProfile(user: User):any{
    let userName = ''
    if(user.firstname){
      userName = user.firstname
    }
    if(user.lastname){
      userName = user.firstname?`${user.firstname} ${user.lastname}`:user.lastname
    }
    const currentUser :MyUserProfile = pick(toJSON(user),[
      'id',
      'permissions'
    ]) as MyUserProfile;
currentUser.name = userName
return currentUser

  }
}
