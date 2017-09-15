//
// Dependências - packages npm
//

var express    = require('express');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var passport   = require('passport');
var ejs        = require('ejs');
var session    = require('express-session');

var courseController = require('./controllers/course');
var userController   = require('./controllers/users');
var clientController = require('./controllers/client');
var authController   = require('./controllers/auth');
var oauth2Controller = require('./controllers/oauth2');

mongoose.connect('mongodb://localhost:27017/noscli');

// TODO: localhost deve ser atualizado para o banco de dados de produçã

// Cria a aplicação Express

var app = express();

// Define o motor de visualização para o ejs

app.set('view engine', 'ejs');

// Usa o pacote body-parser no aplicativo

app.use(bodyParser.urlencoded({
    extended: true
}));

// Usa o suporte de sessão expressa, pois OAuth2orize exige isso

app.use(session({
    secret:            'Super Secret Session Key',
    saveUninitialized: true,
    resave:            true
}));

// Usa o pacote do passaporte

app.use(passport.initialize());

// Cria o nosso roteador Express

var router = express.Router();

//
//  FROM: controllers/ ... ROUTES API
//


// Cria manipuladores de endpoint para /courses

router.route('/courses')
      .post(authController.isAuthenticated, courseController.postCourses)
      .get(authController.isAuthenticated, courseController.getCourses);

// Cria manipuladores de endpoint para /courses/:course_id

router.route('/courses/:course_id')
      .get(authController.isAuthenticated, courseController.getCourse)
      .put(authController.isAuthenticated, courseController.putCourse)
      .delete(authController.isAuthenticated, courseController.deleteCourse);

// Cria manipuladores de endpoint para /users

router.route('/users')
      .post(userController.postUsers)
      .get(authController.isAuthenticated, userController.getUsers);

// TODO: Remove /usuarios GET para producao

// Cria manipuladores de endpoint /clients

router.route('/clients')
      .post(authController.isAuthenticated, clientController.postClients)
      .get(authController.isAuthenticated, clientController.getClients);

// Cria manipuladores de endpoint oauth2 authorize

router.route('/oauth2/authorize')
      .get(authController.isAuthenticated, oauth2Controller.authorization)
      .post(authController.isAuthenticated, oauth2Controller.decision);

// Cria manipuladores de endpoint oauth2 token

router.route('/oauth2/token')
      .post(authController.isClientAuthenticated, oauth2Controller.token);

//
// Teste de Roteamento Oauth
//
// http://localhost:3000/api/oauth2/authorize?client_id=this_is_my_id&response_type=code&redirect_uri=http://localhost:3000
// 
 
//
// Express Server
// 
// Registra todas as nossas rotas com /api

app.use('/api', router);

// Use a porta definida pelo ambiente ou 3000

var port = process.env.PORT || 3000;

// Inicia o servidor

app.listen(3000);
console.log('### ... Express esta escutando em http://localhost:3000 ...###');

// Executar no modo node inspector => node-debug server.js
