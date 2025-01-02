import { Response, Request, NextFunction } from 'express';


export const auth = async(req: Request, res: Response, next: NextFunction) => {

    try {

        if (! req.headers['authorization']) {
            console.log("Not authorized: no authorization in header!")
            return res.status(401).send({ error: 'Not authorized to access this resource' });
        }

        const token: string | undefined = req.headers['authorization']?.replace('Bearer ', '');

        if (token === undefined) {
            console.log("Not authorized: authorization undefined!")
            return res.status(401).send({ error: 'Not authorized to access this resource' });
        }

        if(token != process.env.PLANNER_KEY){
            console.log("Not authorized: key does not match!")
            return res.status(401).send({ error: 'Not authorized to access this resource' });
        }

        next();

    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' });
    }

};
