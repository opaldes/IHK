import 'zone.js/dist/zone-node';
import 'rxjs';
import 'reflect-metadata';
import * as express from 'express';
import { ngExpressEngine } from '@nguniversal/express-engine';
import routes from './app/routing/routes';


//IMPORTANT import your app root module from a precompiled angular app aka factory
import {AppServerModuleNgFactory} from './app/app.server.ngfactory';

//setup express server
const server = express();

// Set the express-engine to bootstrap our root module to the application as html
server.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory // Give it a module to bootstrap(u should use ROOT Module)
}));

//function to render request to index
function ngApp(req:any, res:any) {
  res.render('./index', {req, res});
}

//set the view engine to the server engine
server.set('view engine', 'html');

//set the views directory to out
server.set('views', 'out');

//set the server to handle all request
server.get('**/*', ngApp);

//set server to use the out folder as static for handling static files
server.use(express.static('out'));

//set server port to x default 8000
server.listen('1337');
