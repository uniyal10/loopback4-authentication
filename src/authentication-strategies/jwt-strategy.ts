import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {JWTService} from '../services/jwt.service';
export class  JWTStrategy implements AuthenticationStrategy{
constructor(
  @inject('services.jwt.service')
  public jwtService:JWTService
){

}

  name:string='jwt'
  async authenticate(
request:Request
):Promise<any>{
  const token:string = this.extractCredentials(request)
  const userProfile = await this.jwtService.verifyToken(token)
  return Promise.resolve(userProfile)
}
  extractCredentials(request: Request): string {
   if(!request.headers.authorization){
     throw new HttpErrors.Unauthorized('authorzation header is missing')
   }

   const authHeader = request.headers.authorization
   if(!authHeader.startsWith('Bearer')){
     throw new HttpErrors.Unauthorized('authorizationn header is not type of Bearer')
   }
   const parts = authHeader.split(' ')
   if(parts.length !== 2){
     throw new HttpErrors.Unauthorized('not matching the autorization header pattern')
   }
   const token = parts[1]
   return token

  }


}
