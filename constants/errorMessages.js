module.exports = {
  NOT_FOUND: param => `Not found ${param}`,
  ADDRESS_IS_THERE: 'The address is already there',
  CONTACT_USED: 'The specified contact is already exists.',
  NOT_VALID: param => `Not valid ${param}`,
  WRITE_PASSWORD_OR_EMAIL: 'Please write password or email',
  NOT_ENOUGH_REQUIRED_PARAMS: param => `Please send all required params. You do not send ${param}`,
  PARAMS_IN_CORRECT_FORM: param => `Please write ${param} in correct form`,
  PASSWORD_DOES_NOT_MATCH:
    'This password does not match that entered in the password field, please try again. ',
  PARAM_USED: param => `Provided ${param} is already in use.`,
  USER_IS_NOT_AUTHORIZED: 'User is not authorized.',
  NOT_TOKEN_PROVIDED: 'No token provided',
  NOT_REFRESH_TOKEN: 'No refresh token provided',
  ACCESS_CLOSED: 'Access closed. You have no authority.',
  AUTH_ERROR: 'Auth error',
  CANNOT_RECEIVE_EMAIL:
    'We cannot receive your email. Please try send email later!',
  REFRESH_FAILED: 'Refreshing failed',
  BLOCK_FAILED: 'USER IS ALREADY BLOCKED',
  UNBLOCK_FAILED: 'USER IS ALREADY UNBLOCKED',
  WRITE_TEXT: 'Write text please',
  YOU_DOES_NOT_HAVE_POSTS: 'You does not have any posts',
  YOU_DOES_NOT_HAVE_COMMENTS: 'You does not have any comments'
};
