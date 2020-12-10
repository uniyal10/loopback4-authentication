import {inject} from '@loopback/core'
import {HttpErrors} from '@loopback/rest'
import {promisify} from 'util'
const jwt = require('jsonwebtoken')
const signAsync = promisify(jwt.sign)
const verifyAsync = promisify(jwt.verify)

export class JWTService{
  @inject('auth.jwt.secretKey')
  public readonly key:string
  @inject('auth.jwt.expireIn')
  public readonly expireIn :string

  async generateToken(userProfile:any):Promise<string> {
    if(!userProfile){
      throw new HttpErrors.Unauthorized('error while generating token : userprofile is null ')
    }
    let token = ''
    try{
      token = await signAsync(userProfile,this.key,{
        expiresIn:this.expireIn
      })
    }catch(err){
      throw new HttpErrors.Unauthorized('error generating token'+err)
    }
    return token
  }


  async verifyToken(token:string){
    if(!token){
      throw new HttpErrors.Unauthorized('Error verifyinng token! token is null')
    }
    let userProfile:any
    try{
      const decryptedToken = await verifyAsync(token,this.key)
      userProfile = Object.assign({id:'',name:''},{id:decryptedToken.id,name:decryptedToken.name})
    }catch(err){
      throw new HttpErrors.Unauthorized('error verifying token')
    }
    return userProfile
  }

}
