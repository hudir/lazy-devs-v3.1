/**
 * generator server.js's code all in one file
 * @req request from frontend method:post
 * @file need create a file ? default is false
 * @filePath relative path to save/update the server.js .Defalt is './test/server/server.js'
 * @return string format of code of server.js
 */
const serverJsFull = (
  req,
  file = false,
  filePath = "./test/server/server.js"
) => {
  //Template for server.js

 // new for v3.1
  // passport open auth for google and github
  let passport
  let google =  req.body.google
  let github = req.body.github
  if(google || github)  {
    passport = true
  }
 

  // what we need to do before work on the template?
  let nodemailer = req.body.backend_packages.nodemailer;
  let bt = req.body.backend_packages.bcrypt;
  let dotenv = req.body.backend_packages.dotenv;

  const tm1 = req.body.template == "tm1_session" ? true : false;
  const tm2 = req.body.template == "tm2_jwt_cookie" ? true : false;
  const tm3 = req.body.template == "tm3_jwt_axios" ? true : false;

  // rules for server.js
  // registrationInputs will be schema
  const registrationInputs = req.body.registrationInputs;

  // loginInputs will be checked when user login
  const loginInputs = req.body.loginInputs;

  // the login input can not be empty
  if (loginInputs.length < 1)
    throw console.error("the loginInputs array can not be empty");

  // 1. we need to know which input will be uesed as main-input, will be unique, required, ues it to find user in database
  const main_input = req.body.registrationInputs.filter((el) => el.main)[0];
  const mainName = main_input.name;

  if (!main_input)
    throw console.error("There is no Main input in registrationInputs array");
  // console.log(main_input)

  // 2. will there be a password input?  check type == password // 3. will user want to encrypt the password? password will always be encrypted
  const pw = registrationInputs.filter(
    (el) => el.type.toLowerCase() == "password"
  )[0];
  let pwName;
  if (pw) pwName = pw.name;

  // 3. if user set nodemailer is true, that means he want verify his user's email. that require there is a "email" in registrationInputs
  let emailName = "email";
  if (nodemailer) {
    const emailInput = registrationInputs.filter(
      (el) => el.type.toLowerCase() == "email"
    )[0];
    emailName = emailInput.name;
    if (
      req.body.nodemailerSetting.pass &&
      req.body.nodemailerSetting.user &&
      req.body.nodemailerSetting.senderEmail
    ) {
      if (!registrationInputs.some((el) => el.type == "email"))
        console.error(
          "if user want nodemailer, need to have type email in registrationInputs"
        );
    } else {
      if (!dotenv)
        console.error(
          "if user want nodemailer, need to provide username, password, sender's email"
        );
    }
  }

  // how should we know do we need bcrypt or not bcrypt => bt
  // 1 if pw is true, bt is true
  if (pw) bt = true;
  // nodemailer need to use bcrypt
  else if (nodemailer) bt = true;
  // 2 else if req.body.backend_packages.filter(x=>x='bcrypt') is true, bt is also true
  else if (req.body.backend_packages.bcrypt) bt = true;

  let server_js_full = `
  // importing dependencies
  const express = require('express');
  ${bt ? "const bcrypt = require('bcrypt');" : ""}
  const cors = require('cors');
  const mongoose = require('mongoose');
  const app = express();
  const secret = \`${
    req.body.secretKey ? req.body.secretKey : null
  }\` || process.env.SECRETKEY || "test";
  ${nodemailer ? "const nodemailer = require('nodemailer');" : ""}
  
  ${
    dotenv
      ? `// config dotenv
  require('dotenv').config();`
      : ""
  }
  ${passport ? `const passport = require('passport');` : ''}
  ${github ? `const GitHubStrategy = require('passport-github2').Strategy;` : ''}
  ${google ? `const GoogleStrategy = require('passport-google-oauth20');` : ''}

  
  // importing Port
  const port = process.env.PORT || 5000;
  const dbLink = process.env.MONGODB || "mongodb://localhost:27017/${
    req.body.project_name
      ? req.body.project_name.split(" ").join("_")
      : `lazydev`
  }"
  ${
    tm1 || passport
      ? `// Template - 1 session + proxy
  const session = require('express-session'); `
      : ""
  }
  
  ${
    tm2
      ? `// Template - 2  jsonwebtoken + cookie-parser
  const jwt = require('jsonwebtoken');
  const cookieParser = require('cookie-parser') `
      : ""
  }
  
  ${
    tm3
      ? `// Template - 3  jsonwebtoken + axios(.create) save token in localStorage
  const jwt = require('jsonwebtoken');`
      : ""
  }
  
  // connect to database
  mongoose.connect(dbLink, err => {
      if (err) throw (err)
      console.log(${
        req.body.mongoConnectMessage
          ? req.body.mongoConnectMessage
          : `"MongoDB is connected"`
      })
  });
  
  ${
    nodemailer
      ? `// nodemailer settings with mailtrap
  // https://nodemailer.com/about/
  const transporter = nodemailer.createTransport({
      host: "${req.body.nodemailerSetting.host || `smtp.mailtrap.io`}",
      port: ${req.body.nodemailerSetting.port || `25 || 465 || 587 || 2525`},
      auth: {
          user: ${
            req.body.nodemailerSetting.user
              ? `"${req.body.nodemailerSetting.user}"`
              : "process.env.EMAIL_USER"
          },
          pass: ${
            req.body.nodemailerSetting.pass
              ? `"${req.body.nodemailerSetting.pass}"`
              : "process.env.EMAIL_PASS"
          }
      }
  });
  // function to send email using transporter
  const nodeMailerOrigin = "http://localhost:5000/user"
  function sendEmail(mailTo, subject, message) {
      return new Promise((resolve, reject) => {
          transporter.sendMail({
              from: "${
                req.body.nodemailerSetting.senderEmail
                  ? req.body.nodemailerSetting.senderEmail
                  : "process.env.SENDER"
              }",
              to: mailTo,
              subject: subject,
              html: message // sending html formed code
          })
              .then(data => {
                  resolve(data);
              })
              .catch(error => {
                  reject({ errCode: 12, data: error, path: 'nodemailer.sendEmail' });
              })
      })
  };`
      : ""
  }
  
  // middleware
  app.use(express.json())
  app.use(express.urlencoded({extended: false}))
  
  ${
    tm1  ? `// Template - 1 session + proxy
  app.use(cors())
  app.use(session({ 
      secret: secret,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: ${req.body.expireTime} } // time period for session data(e.g. store data for 30 day)
  }))`
      : ""
  }
  
  ${
    tm2
      ? `// Template - 2  jsonwebtoken + cookie-parser
  const frontendOrigin = "${
    req.body.frontendOrigin ? req.body.frontendOrigin : `*`
  }";
  // here need test, tem2 cors options {origin: true} will work, origin: frontendOrigin shold also work, if it ok delete this line
  app.use(cors({ origin: frontendOrigin, credentials: true }));
  app.use(cookieParser());`
      : ""
  }
  
  ${
    tm3
      ? `// Template - 3  jsonwebtoken + axios(.create) save token in local storage
  app.use(cors())`
      : ""
  }

  ${tm3 && passport ? `app.use(session({ 
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: ${req.body.expireTime} } // time period for session data(e.g. store data for 30 day)
}))` : ""}
  
  // Routers
  // index router
  const indexRouter = express.Router()
  
  indexRouter.get('/', home_controller)
  
  // user router
  const userRouter = express.Router()
  
  userRouter.post('/login', login_submit_controller)
  userRouter.post('/create', register_submit_controller)
  
  ${nodemailer ? `userRouter.get('/verify', verify_email_controller)` : ""}
  userRouter.get("/profile", auth, profile_controller);
  userRouter.get("/logout", auth, logout_controller);
  userRouter.get("/loginStatus", auth, loginStatus_controller);
  
  // Router settings
  app.use('/', indexRouter)
  app.use('/user', userRouter)

  ${passport ? `// call passport function
  passportOauth(app);` : ""}
  
  // server listen and connect to database
  app.listen(port, () => console.log(${
    req.body.serverListenMessage
      ? req.body.serverListenMessage
      : `"Server is running on port: " + port`
  } ));
  
  // mongoose Schema and model
  const { Schema, model } = require('mongoose');
  
  const userSchema = new Schema({
      ${
        nodemailer
          ? `verify: {
          email: {
          type: Boolean,
          default: false
          } 
      },`
          : ""
      }
      ${
        nodemailer
          ? `secretKey: {
          type: String
      },`
          : ""
      }
      ${google ? `googleID: String,` : ""}
      ${github ? `githubID: String,` : ""}
      ${registrationInputs
        .map((el) => {
          if (el.type != "button")
            return `${el.name}: {
              required: ${el.required},
              unique: ${el.unique},
              type: ${
                el.type == "number"
                  ? `Number`
                  : el.type == "checkbox"
                  ? `Boolean`
                  : el.type == "date"
                  ? `Date`
                  : `String`
              }
          }`;
        })
        .join(",\n    ")
        .split(",")
        .filter((x) => x)
        .join(",")}
  });
  
  // mongoose model
  const User_model = model('user', userSchema);
  
  // controllers
  function home_controller(req, res) {
      console.log("Front end say hi")
      res.json("Hello from Back end")
  } // Home Page
  
  // sign up controller-start
  async function register_submit_controller(req, res) {
      const { ${mainName} } = req.body;
      ${pw ? `const { ${pwName} } = req.body;` : ""}

      // for(let key in req.body){
      //   if(key.split('_')[1] == 'number'){
      //     req.body[key] = + req.body[key]
      //   }
      // }
    
      try {
        // check the ${mainName} is already used or not
        const existUser = await mongodbFindOne(User_model, { ${mainName} });
        if (existUser)
          return res.json({
            errCode: 11,
            data: { msg: "${mainName} already used" },
            path: "create user",
          });
    
        // ${mainName} is ready to use
        ${
          pw
            ? `// encrypt ${pwName}
        const hashed${
          pwName[0].toUpperCase() + pwName.slice(1)
        } = await encrypt(${pwName});
        //update the req.body.${pwName}
        req.body.${pwName} = hashed${
                pwName[0].toUpperCase() + pwName.slice(1)
              };`
            : ""
        }
    
        // save data in mongodb
        const userSaved = await mongodbSave(User_model, req.body);
        // get the _id of the user from mongodb
        const id = userSaved._id.toString();
    
        ${
          nodemailer
            ? `
        // send verification Emails to user by calling function sendEmail
        // create secretKey will send to user in verify email) based on id
        const nodemailerSecretKey = await encrypt(id);
        // save the secretKey to database
        await mongodbUpdate(
          User_model,
          { _id: id },
          { secretKey: nodemailerSecretKey }
        );
    
        // create the email message
        const message = \`Hello,<br>
                 The Email "\${req.body.${emailName}}" is used to register in ${
                req.body.project_name ? req.body.project_name : "lazy dev"
              }. To verify Your account please click on <a href="\${nodeMailerOrigin}/verify?${emailName}=\${req.body.${emailName}}&secretKey=\${nodemailerSecretKey}">This Link</a>
                 Thanks
                 Auth-Code-Gen Team.\`;
    
        await sendEmail(
          req.body.${emailName},
          "Verification Email from ${
            req.body.project_name ? req.body.project_name : "lazy dev"
          }",
          message
        ); // end of nodemailer part
        `
            : ""
        }
    
        ${
          tm1
            ? `// Template - 1 session + proxy
        // save user info in session
        req.session.user = userSaved;
        req.session.user.password = null;
        res.json({ signup: true, login: true${
          nodemailer ? `, verificationEmailSended: true` : ""
        } });`
            : ""
        }
        
    
        ${
          tm2
            ? `// Template - 2  jsonwebtoken + cookie-parser
        // create jwt token based on id and secret
        const token = await jwtSign({ id }, secret, { expiresIn: ${
          req.body.expireTime
        } });
        res
          .cookie("token", token, {
            expires: new Date(Date.now() + ${req.body.expireTime}),
            httpOnly: true,
          }) 
          .json({ signup: true, login: true${
            nodemailer ? `, verificationEmailSended: true` : ""
          } });
        // end this template`
            : ""
        }
    
        ${
          tm3
            ? `// Template - 3  jsonwebtoken + axios(.create) save token in localStorage
        // create a jwt token and send it to front end
        const token = await jwtSign({ id }, secret, { expiresIn: ${
          req.body.expireTime
        } });
        res.json({
          signup: true,
          login: true,
          token${
            nodemailer
              ? `,
          verificationEmailSended: true`
              : ""
          }
        });
        // end this template`
            : ""
        }
    
        req.user = { ...userSaved._doc, password: null, secretKey: null };
      } catch (error) {
        res.json(error);
      }
    } // controller-end
  
  
  
  
  // login controller-start
  async function login_submit_controller(req, res) {
      const { ${mainName} } = req.body;
      ${pw ? `const { ${pwName} } = req.body;` : ""}
    
      try {
        const user = await mongodbFindOne(User_model, { ${mainName} });
        // check if user not exist, user should be null
        if (!user) {
          return res.json({
            errCode: 15,
            data: { msg: "${mainName} not find" },
            path: "user login",
          });
        } // end  if (!user)
    
        ${
          pw
            ? `// user exist, compare the password => user.password, password
        const compareResult = await compareEncryptData(${pwName}, user.${pwName});
        if (!compareResult) {
          return res.json({
            errCode: 16,
            data: { msg: "wrong ${pwName}" },
            path: "user login",
          });
        } // end (!compareResult)`
            : `checkAllLoginData = await mongodbFindOne(User_model, { ${loginInputs.map(
                (el) => `${el.name}`
              )} });
        if (!checkAllLoginData) {
          return res.json({
            errCode: 16,
            data: { msg: "wrong login data" },
            path: "user login",
          })}; `
        }
    
        // get the _id of the user from mongodb
        const id = user._id.toString();
    
        ${
          tm1
            ? `// Template - 1 session + proxy
        req.session.user = user;
        req.session.user.password = null; 
        res.json({ login: true });`
            : ""
        }
       
    
        ${
          tm2
            ? `// Template - 2  jsonwebtoken + cookie-parser
        // create jwt token based on id and secretKey
        const token = await jwtSign({ id }, secret, { expiresIn: ${req.body.expireTime} });
        res.cookie("token", token, {
            expires: new Date(Date.now() + ${req.body.expireTime}),
            httpOnly: true,
          }) 
          .json({ login: true });
        // end this template`
            : ""
        }
    
        ${
          tm3
            ? `// Template - 3  jsonwebtoken + axios(.create) save token in localStorage
        // create a jwt token and send it to front end
        const token = await jwtSign({ id }, secret, { expiresIn: ${req.body.expireTime} })
        res.json({ login: true, token });
        // end this template`
            : ""
        }
    
        req.user = { ...user._doc, password: null, secretKey: null };
      } catch (error) {
        res.json(error);
      }
    } // controller-end
  
  
  ${
    nodemailer
      ? `async function verify_email_controller(req, res) {
      const { ${emailName}, secretKey } = req.query;
    
      try {
        // use ${emailName} and secretKey to find that user
        const user = await mongodbFindOne(User_model, { ${emailName}, secretKey });
        // if user==null that means verify_email is unsuccessful
        if (!user) return res.json({ errCode: 13, data: err, path: "verify_email_controller.user_not_find" });
        
        // verify_email success update db
        await mongodbUpdate(User_model, {_id: user._id}, { "verify.email": true });
        res.json({ path: "emailVerification", verified_email: true });
      } catch (error) {
        res.json(error);
      }
  };`
      : ""
  }
  
  function logout_controller(req, res) {
    ${
      tm1
        ? `// Template - 1 session + proxy
    req.session.destroy();
    res.json({ login: false, logout: true })`
        : ""
    }
  
    ${
      tm2
        ? `// Template - 2  jsonwebtoken + cookie-parser
    res
    .clearCookie('token')
    .json({ login: false, logout: true })`
        : ""
    }
      
    ${
      tm3
        ? `// Template - 3  jsonwebtoken + axios(.create) save token in localStorage
    // with this template the logout will happen in front end, just destroy the token in localStorage
    res.json({ login: false, logout: true });`
        : ""
    }
  };
  
  function profile_controller(req, res) {
      res.json(req.user);
  };
  
  function loginStatus_controller(req, res) {
    res.json({ login: true })
  }
  
  // middleware
  
  // auth check
  // this middleware is used to check if user is login or not
  // if user is login, save user data in req.user and call next()
  async function auth(req, res, next) {
    ${
      tm1
        ? `// Template - 1 session + proxy
    if(req.session.user) {
      req.user = { ...req.session.user, password: null, secretKey: null};
      next();
    }  else res.json({ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' })`
        : ""
    }
    
    ${
      tm2
        ? `// Template - 2  jsonwebtoken + cookie-parser
    const token = req.cookies.token;
    if (!token) return res.json({ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' });
    //  check is there token => convert token to id => find user by id
    try {
      const id = (await jwtVerify(token, secret)).id;  
      const user = await mongodbFindOne(User_model, { _id: id });
      if (user) {
        req.user = {...user._doc, password: null, secretKey: null};
        next()
      } else res.json({ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' })
    }
    catch (error) {
      res.json(error)
    } // end Template - 2  jsonwebtoken + cookie-parser`
        : ""
    }
    
    ${
      tm3
        ? `// Template - 3  jsonwebtoken + axios(.create) save token in localStorage
    const token = req.headers.token;
    if (token == undefined) return res.json({ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' });  
    //  check is there token => convert token to id => find user by id
  try {
    const id = (await jwtVerify(token, secret)).id;
    const user = await mongodbFindOne(User_model, { _id: id });
    if (user) {
      req.user = {...user._doc, password: null, secretKey: null};
      next()
    } else res.json({ errCode: 33, data: { msg: "you need login first" }, path: 'middleware.auth' })
  }
  catch (error) {
    res.json(error)
  } // end Template - 3  jsonwebtoken + axios(.create) save token in localStorage`
        : ""
    }
  };
  
  
  // partial functions
  ${
    bt
      ? `function encrypt(data, rounds = 10) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(rounds, (error, salt) => {
        if (error)
          return reject({ errCode: 0, data: error, path: "encrypt.genSalt" });
        else {
          bcrypt.hash(data, salt, (error, hashedData) => {
            if (error)
              return reject({ errCode: 1, data: error, path: "encrypt.hash" });
            else {
              return resolve(hashedData);
            }
          });
        }
      });
    });
  }
  
  function compareEncryptData(data, encryptData) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(data, encryptData, (error, result) => {
        if (error)
          return reject({
            errCode: 2,
            data: error,
            path: "compareEncryptData.compare",
          });
        else {
          resolve(result);
        }
      });
    });
  }`
      : ""
  }
    
  ${
    tm2 || tm3
      ? `function jwtSign(data, secretKey, option = null) {
    return new Promise((resolve, reject) => {
      if (typeof data == "object" && !Array.isArray(data) && option) {
        jwt.sign(data, secretKey, option, (error, token) => {
          if (error)
            return reject({
              errCode: 3,
              data: error,
              path: "jwtSign.sign.payload.obj",
            });
          else {
            // console.log("token with option");
            return resolve(token);
          }
        });
      } else {
        jwt.sign(data, secretKey, (error, token) => {
          if (error)
            return reject({
              errCode: 4,
              data: error,
              path: "jwtSign.sign.payload.str",
            });
          else {
            // console.log("token without option");
            return resolve(token);
          }
        });
      }
    });
  }
  
  function jwtVerify(token, secret) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, resultObj) => {
          if(error) reject({errCode: 5, data: error, path: 'jwtVerify.verify'})
          else {
            resolve(resultObj)
          }
        })
      })
    }`
      : ""
  }
    
    
    
    function mongodbSave(model, data) {
      return new Promise((resolve, reject) => {
        model
          .create(data)
          .then((savedData) => resolve(savedData))
          .catch((error) =>
            reject({ errCode: 20, data: error, path: "mongodbSave.create" })
          );
      });
    }
    
    function mongodbUpdate(model, query, dataToUpdate) {
      return new Promise((resolve, reject) => {
        model
          .updateOne(query, dataToUpdate)
          .then((result) => resolve(result))
          .catch((error) =>
            reject({ errCode: 21, data: error, path: "mongodbUpdate.updateOne" })
          );
      });
    }
    
    function mongodbFindOne(model, query) {
      return new Promise((resolve, reject) => {
        model
          .findOne(query)
          .then((result) => {
            resolve(result);
          })
          .catch((error) =>
            reject({ errCode: 22, data: error, path: "mongodbFindOne.findOne" })
          );
      });
    }

  ${passport ? `const passportOauth = (app) => {
    // passport codes start
    const passport = require('passport');
    ${github ? `const GitHubStrategy = require('passport-github2').Strategy;
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;` : ""}
    ${google ? `const GoogleStrategy = require('passport-google-oauth20'); 
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;` : ""}
    ${!bt ? `const bcrypt = require('bcrypt');` : ""}
    
    passport.serializeUser(function (user, done) {
      done(null, user);
    });
  
    passport.deserializeUser(function (obj, done) {
      done(null, obj);
    });
  
    ${github ? `passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL:
            ${req.body.backendOrigin + req.body.port} + '/user/github/callback',
        },
        function (accessToken, refreshToken, profile, done) {
         
          User_model.findOne({ githubID: profile._json.id }, (err, user) => {
            if (err) return console.error(err);
            if (user) return done(null, user);
            // no such user found in db, create new user
  
            let githubEmail;
            // to see if this email alreay in out db
            if (profile._json.email) {
              User_model.findOne({ email: profile._json.email }, (err, existUser) => {
                if (err) return console.error(err);
  
                if (existUser)
                  // if we find this email, update this user with his github id
                  User_model.findOneAndUpdate(
                    { _id: existUser._id },
                    { $set: { githubID: profile._json.id } },
                    { new: true },
                    (err, updatedUser) => {
                      if (err) return console.error(err);
                      return done(null, updatedUser);
                    }
                  );
                else {
                  // no existUser we will save him
                  githubEmail = profile._json.email;
                  // here need bcrypt the password
                  bcrypt.hash(profile._json.url, 10, (err, notPassword) => {
                    if (err) return console.error(err);
                    User_model.create({ // here you need config the profile with your User_model Schema
                      githubID: profile._json.id,
                      email: githubEmail,
                      password: notPassword,
                      // firstName: profile._json.name,
                      // lastName: '   ',
                      // verified: true,
                      // avatar: profile._json.avatar_url,
                    })
                      .then((newUser) => done(null, newUser))
                      .catch((err) => console.error(err));
                  });
                }
              });
            } else {
              // profile._json.email is not true
              githubEmail = 'thisIsFakeEmail' + profile._json.id + '@github.com';
              // here need bcrypt the password
              bcrypt.hash(profile._json.url, 10, (err, notPassword) => {
                if (err) return console.error(err);
                User_model.create({ // here you need config the profile with your User_model Schema
                  githubID: profile._json.id,
                  email: githubEmail,
                  password: notPassword,
                  // firstName: profile._json.name,
                  // lastName: '   ',
                  // verified: true,
                  // avatar: profile._json.avatar_url,
                })
                  .then((newUser) => done(null, newUser))
                  .catch((err) => console.error(err));
              });
            }
          });
        }
      )
    );` : ""}
    ${google ? `passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL:
          ${req.body.backendOrigin + req.body.port} + '/authentication/google/callback',
        },
        function (accessToken, refreshToken, profile, cb) {
      
          User_model.findOne({ googleID: profile._json.sub }, (err, user) => {
            if (err) return console.error(err);
            if (user) return cb(null, user);
            // no such user found in db, create new user
  
            // no email we will create one new
            const googleEmail = profile._json.email || 
              'thisIsFakeEmail' + profile._json.sub + '@google.com';
            // here need bcrypt the password
            bcrypt.hash(profile._json.picture, 10, (err, notPassword) => {
              if (err) return console.error(err);
              User_model.create({ // here you need config the profile with your User_model Schema
                googleID: profile._json.sub,
                email: googleEmail,
                password: notPassword,
                // firstName: profile._json.given_name,
                // lastName: profile._json.family_name,
                // verified: true,
                // avatar: profile._json.picture,
              })
                .then((newUser) => {
                  return cb(null, newUser);
                })
                .catch((err) => console.error(err));
            });
          });
        }
      )
    );` : ""}
    
    app.use(passport.initialize());
    app.use(passport.session());
  
    // app.get('/logout', function(req, res){
    //    req.logout();
    //    res.redirect('http://localhost:3000');
    //  });
  
    //  function ensureAuthenticated(req, res, next) {
    //   if (req.session.user) {
    //     req.user = req.session.user
    //     return next();
    //   }
    //   else if (req.isAuthenticated()) { return next(); }
    //   res.redirect('/login')
    // }
    // passport codes endet
  };
  
  // module.exports = passportOauth;
  ` : ""}
  
  `;

  const trimEmptyLine = require("./tools/trimEmptyLine");
  server_js_full = trimEmptyLine(server_js_full);

  if (file) {
    const path = require("path");
    const fs = require("fs");
    fs.writeFile(path.join(__dirname, filePath), server_js_full, (err) => {
      if (err) throw err;
    });
  }

  return server_js_full;
};

module.exports = serverJsFull;
