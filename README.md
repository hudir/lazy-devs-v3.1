# lazy-devs-v3.1

### add .gitignore to zip file(rewrite zip code)
### passport open auth for google and github
   ! passport will use session - that's cookie
 ```js  
 req.body.google
 req.body.github

 req.body.githubSetting = {
  clientId: "clientId",
  secret: "secret"
 }

  req.body.googleSetting = {
  clientId: "clientId",
  secret: "secret"
 }
   // // inside req.body = {
  //   google: true, 
  //   googleSetting: {
  //   clientId:xxxx,
  //   secret:xxxx
  // }
  //   github: true,
  //   githubSetting: {
  //   clientId:xxxx,
  //   secret:xxxx
  // }
  // }
 ``` 
 request come from client



# lazy-devs-v3
hey, here we go V3


# How to use
After you download template zip file.

- Extract the project
- open teminal in project root folder(where you can see server folder and client folder)
- type ```npm install``` , enter, wait till ....
- type ```npm run install_both``` , enter, wait till .... here you need wait the info from front end, the time is a little bit long
- type ```npm start``` , enter, now you can start your project




# error code for running template
{errCode: 0, data: error, path: 'encrypt.genSalt'}

{errCode: 1, data: error, path: 'encrypt.hash'}

{errCode: 2,data: error,path: "compareEncryptData.compare",}

{errCode: 3, data: error, path: 'jwtSign.sign.payload.obj'}

{errCode: 4, data: error, path: 'jwtSign.sign.payload.str'}

{errCode: 5, data: error, path: 'jwtVerify.verify'}

{errCode: 20, data: error, path: 'mongodbSave.create'}

{errCode: 21, data: error, path: 'mongodbUpdate.updateOne'}

{errCode: 22, data: error, path: 'mongodbFindOne.findOne'}

{errCode: 26, data: error, path: 'req.session.save'}

{errCode: 11, data: { msg: "email already used" }, path: 'create user'} // find the email address in DB

{ errCode: 12, data: error, path: 'nodemailer.sendEmail' }

{ errCode: 14, data: err, path: 'send verification email' }

{errCode: 15, data: { msg: "email not find" }, path: 'user login'}

{errCode: 16, data: { msg: "wrong password" }, path: 'user login'}

{errCode: 17, data: { msg: "wow something wrong" , ...err}, path: 'user logout'}

{errCode: 18, data: { msg: "wow something wrong" , ...err}, path: '/user/profile'}

{ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' }

# some template logic
- when you want use nodemailer, you must have a input which type == "email".
- password will always encrypted
- registrationInputs will be add to Schema except type == "button"
- if you put nothing in loginInputs, the main input of registrationInputs will be the loginInputs(your first registrationInput will be main input by default)
