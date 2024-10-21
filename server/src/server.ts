import 'dotenv/config'

import './handlers/auto-сlose'
import './handlers/mail'

import { application } from './application'
import { authorizeRoute } from './routes/authorize.route'
import { userRoute } from './routes/user.route'
import { supportRoute } from './routes/support.route'

new application([
    new authorizeRoute(),
    new userRoute(),
    new supportRoute()
]).listen()