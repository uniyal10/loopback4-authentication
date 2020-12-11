// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core'
import {repository} from '@loopback/repository'
import {getJsonSchema, post, requestBody} from '@loopback/rest'
import * as _ from 'lodash'
import {PermissionKeys} from '../authorization/permission-keys'
import {User} from '../models'
import {UserRepository} from '../repositories'
import {BcryptHasher} from '../services/hash.password'
import {validateCredentials} from '../services/validator'
// import {inject} from '@loopback/core';


export class AdminController {
  constructor(
    @repository(UserRepository)
    public userRepository:UserRepository,
    @inject('service.hasher')
    public hasher :BcryptHasher
  ) {}



  @post('/user/admin',{
    responses:{
      '200':{
        description:'Admin',
        content:{
          schema:getJsonSchema(User)
        }
      }
    }
  })
  async create(@requestBody() admin:User){
    validateCredentials(_.pick(admin,['email','password']))
    //set permissions

    admin.permissions = [PermissionKeys.CreateJob,PermissionKeys.UpdateJob,PermissionKeys.DeleteJob]

    //encrypt
    admin.password =await this.hasher.hashPassword(admin.password)

    const saveUser  = await this.userRepository.create(admin)

    return saveUser

  }
}
