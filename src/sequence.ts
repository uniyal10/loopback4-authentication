import {AuthenticateFn, AuthenticationBindings, AUTHENTICATION_STRATEGY_NOT_FOUND, USER_PROFILE_NOT_FOUND} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceActions, SequenceHandler} from '@loopback/rest';

export class MySequence implements SequenceHandler {
  constructor(
    // ... Other injections
    // ------ ADD SNIPPET ---------
    @inject(SequenceActions.FIND_ROUTE) protected findRoute:FindRoute,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke:InvokeMethod,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams:ParseParams,
    @inject(SequenceActions.SEND) public send:Send,
    @inject(SequenceActions.REJECT) public reject:Reject,

    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn, // ------------- END OF SNIPPET -------------
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);

      // ------ ADD SNIPPET ---------
      //call authentication action
      await this.authenticateRequest(request);
      // ------------- END OF SNIPPET -------------

      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      // ------ ADD SNIPPET ---------
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {statusCode: 401 /* Unauthorized */});
      }
      // ------------- END OF SNIPPET -------------

      this.reject(context, error);
      return;
    }
  }


}
