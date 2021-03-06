const isEmpty = (string) => {
  if(string.trim() === "") return true
  else return false
}

const isEmail = (email) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(email.match(regex)) return true
  else return false
}

exports.signupValidator = data => {
let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Email must not be empty"
  } else if (!isEmail(data.email)) {
    errors.email = "Please enter your valid email"
  }
  if (isEmpty(data.password))
    errors.password = "Password must not be empty"
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Your password not match"
  if (isEmpty(data.handle))
    errors.handle = "Handle must not be empty"
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.signinValidator = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = "Email must not be empty"
  if (isEmpty(data.password)) errors.password = "Password must not be empty"

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}