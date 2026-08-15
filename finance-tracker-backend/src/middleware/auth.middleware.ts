import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    user?: {
        userId : number,
        email  : string,
    }
}

export const authenticate = (
    req : AuthRequest,
    res : Response,
    next : NextFunction
) => {
    try {
        const token = req.cookies.token

        if(!token){
            return res.status(400).json({
                success : false,
                message : 'Unathorized'
            })
        }

        const jwtSecret = process.env.JWT_SECRET

        if(!jwtSecret){
            throw new Error('JWT_SECRET is not configured')
        }

        const decoded = jwt.verify(token, jwtSecret)

        if(typeof decoded === 'string'){
            return res.status(400).json({
                success : false,
                message : 'Invalid token.'
            })
        }

        req.user = {
            userId : decoded.userId as number,
            email : decoded.email as string
        }

        next()
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : 'Invalid or expired token.'
        })
    }
}