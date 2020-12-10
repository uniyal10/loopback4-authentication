import {inject} from '@loopback/core'
import {compare, genSalt, hash} from 'bcryptjs'

interface PasswordHasher<T =string>{
  hashPassword(password : T):Promise<T>
  comparePassword(providedpass:T,storedPass:T):Promise<boolean>
}


export class BcryptHasher implements PasswordHasher<string>{
async  comparePassword(providedpass: string, storedPass: string): Promise<boolean> {

const passwordMatched = await compare(providedpass,storedPass)
return passwordMatched

}
 @inject('rounds')
 public readonly round:number
  async hashPassword(password:string){
  const salt = await genSalt(this.round)
  return await hash(password,salt)
  }
}
