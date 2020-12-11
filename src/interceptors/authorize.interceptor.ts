import {AuthenticationBindings} from '@loopback/authentication';
import {
  Getter,

  /* inject, */
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {intersection} from 'lodash';
/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', {tags: {name: 'authorize'}})
export class AuthorizeInterceptor implements Provider<Interceptor> {

  constructor(
    @inject(AuthenticationBindings.METADATA)
    public metadata:any,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser:Getter<any>
  ) {}


  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here


    if(!this.metadata){
      return await next()
    }

      const result = await next();
     const requiredPermissions = this.metadata[0].options
     const user = await this.getCurrentUser()
    let rPermission:any = new Array(requiredPermissions.required)
      // Add post-invocation logic here
    const results =  intersection(user.permissions,rPermission).length

    //  console.log( user.permissions+' vs '+ rPermission+' vs '+results)
    //  console.log(results+' vs '+rPermission[0].length)

    // console.log(rPermission.push('hello')+' vs '+user.permissions.push('hello'))
    // console.log(rPermission+' vs '+user.permissions)

     if(results !== rPermission.length){
       throw new HttpErrors.Forbidden('Invalid access permissions')
     }



     return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
