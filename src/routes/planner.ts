import express, { Express, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import fs from 'fs'
import { PlanRun, RunStatus } from '../run_planner';
import request from 'request';


export interface MulterFile {
    key: string // Available using `S3`.
    path: string // Available using `DiskStorage`.
    mimetype: string
    originalname: string
    size: number
  }

export const plannerRouter = express.Router();


const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req: Request, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });


plannerRouter.get('/', async (req: Request, res: Response) => {

    res.status(201).send({ name: 'FD Standard'});
});


plannerRouter.post('/', upload.any(), async (req: Request, res: Response) => {

    // console.log(req.files);

    if(!req.files){
        return res.status(400).json({ error: 'No files uploaded' });
    }

    let files = req.files as Express.Multer.File[]

    let domain = files.find(f1 => f1.fieldname == 'domain')
    if (!domain) {
        return res.status(400).json({ error: 'No domain uploaded' });
    }

    let problem = files.find(f2 => f2.fieldname == 'problem')
    if (!problem) {
        return res.status(400).json({ error: 'No problem uploaded' });
    }

    let plan_run = new PlanRun('1test', domain, problem);

    res.status(201).send({id: plan_run.id, status: plan_run.status});

    let result = await plan_run.run();
    console.log(req.body.callback)

    let data = {
        id: plan_run.id,
        status: plan_run.status,
        plan: []
    }

    if(plan_run.status == RunStatus.FINISHED){
        data.plan = plan_run.get_plan()
    }

    request.post(
        {
        url:req.body.callback,
        json: data,
        headers: {
            'Content-Type': 'application/json'
        }
        },
      function(error, response, body){
        console.log(error);
        console.log(response);
        console.log(body);
        res.send(body);
      });

    console.log(plan_run.status)
    
});