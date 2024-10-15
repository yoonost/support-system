import 'dotenv/config'

import { application } from './application'
import { authorizeRoute } from './routes/authorize.route'
import { userRoute } from './routes/user.route'

new application([
    new authorizeRoute(),
    new userRoute()
]).listen()