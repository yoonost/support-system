import 'dotenv/config'

import Application from './application'

import authorizeRoute from './routes/authorize.route'
import userRoute from './routes/user.route'

const application: Application = new Application([
    new authorizeRoute(),
    new userRoute()
])

application.listen()