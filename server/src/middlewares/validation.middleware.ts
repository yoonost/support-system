import { type RequestHandler, type Request, type Response, type NextFunction } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import response from '../utils/response.util'

const formatErrors = (errors: ValidationError[]): Record<string, string[]> => {
    return errors.reduce((result, error) => {
        if (error.constraints) {
            result[error.property] = Object.values(error.constraints)
        }
        if (error.children && error.children.length > 0) {
            result[error.property] = result[error.property] || []
            result[error.property].push(...formatErrors(error.children)[error.property])
        }
        return result
    }, {} as Record<string, string[]>)
}

const validationMiddleware = (type: any, skipMissingProperties = false): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        validate(plainToInstance(type, req.body), { skipMissingProperties }).then((errors: ValidationError[]): void => {
            if (errors.length > 0) {
                const formattedErrors = formatErrors(errors)
                response(400, {
                    message: 'One or more fields contain invalid data',
                    details: formattedErrors
                }, res)
            } else next()
        })
    }
}

export default validationMiddleware