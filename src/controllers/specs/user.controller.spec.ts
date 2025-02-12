export const CredentialSchema = {
  type:'object',
  required:['email','password'],
  properties:{
    email:{
      type:'string',
      format:'email'
    },
    password:{
      type:'string',
      minLength:8
    },
  },
}

export const CredentialsRequestBody = {
  description:'the input  of login function',
  required:true,
  content:{
    'application/json':{
      schema:CredentialSchema
    }
  }
}
