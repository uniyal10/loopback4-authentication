// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getJsonSchema, post, requestBody} from '@loopback/rest';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt.service';
import {MyUserService} from '../services/user.service';
import {validateCredentials} from '../services/validator';
import {CredentialsRequestBody} from './specs/user.controller.spec';
// import {inject} from '@loopback/core';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository:UserRepository,
    @inject('service.hasher')
    public hasher :BcryptHasher,
    @inject('services.user.service')
    public userService:MyUserService,
    @inject('services.jwt.service')
    public jwtService :JWTService
  ) {}

  @post('/user/signup',{
    responses:{
      '200':{
        description:'User',
        content:{
          schema:getJsonSchema(User)
        }
      }
    }
  })
  async signup(@requestBody() userData:User){
    validateCredentials(_.pick(userData,['email','password']))


    //set permissions
    userData.permissions = [PermissionKeys.AccessAuthFeature]


    //encrypt
    userData.password =await this.hasher.hashPassword(userData.password)

    const saveUser  = await this.userRepository.create(userData)

    return saveUser

  }

@post('/user/login',{
  responses:{
    '200':{
      description:'token',
      content:{
        'application/json':{
          Schema:{
            type:'object',
            properties:{
              token:{
               type:'string'
              }
            }
          }
        }
      }
    }
  }
})
  async login(@requestBody(CredentialsRequestBody) credentials:Credentials):Promise<{token:string}>{
    const user = await this.userService.verifyCredentials(credentials)
    const profile = await this.userService.convertToUserProfile(user)

   console.log(user)
   console.log(profile)

   //generate a json web token
     const token =await  this.jwtService.generateToken(profile)
    return Promise.resolve({token})
  }

  @get('/user/me')
  @authenticate('jwt')
async me(
  @inject(AuthenticationBindings.CURRENT_USER)
  currentUser:any
):Promise<any>{
  return Promise.resolve(currentUser)
}


}
