import express, { Express, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import fs from 'fs'
import { create_base_plan_run, create_temp_goal_plan_run, PlanRun, PlanRunTempGoals, RunStatus } from '../run_planner';
import { agenda } from '..';
import { toPDDL_domain, toPDDL_problem } from '../pddl';
import { auth } from '../middleware/auth';


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


plannerRouter.get('/:id', auth, async (req: Request, res: Response) => {

    // TODO return status of run with id 

    res.status(201).send("TODO");
});


// plannerRouter.post('/files', upload.any(), async (req: Request, res: Response) => {

//     // console.log(req.files);

//     if(!req.files){
//         return res.status(400).json({ error: 'No files uploaded' });
//     }

//     let files = req.files as Express.Multer.File[]

//     let domain = files.find(f1 => f1.fieldname == 'domain')
//     if (!domain) {
//         return res.status(400).json({ error: 'No domain uploaded' });
//     }

//     let problem = files.find(f2 => f2.fieldname == 'problem')
//     if (!problem) {
//         return res.status(400).json({ error: 'No problem uploaded' });
//     }

//     let plan_run = create_base_plan_run('run-' + Date.now(), domain.path, problem.path);

//     res.status(201).send({id: plan_run.id, status: plan_run.status});

//     agenda.now('planner call', [plan_run, req.body.callback])
    
// });


plannerRouter.post('/', auth, async (req: Request, res: Response) => {

  let model = JSON.parse(req.body.model as string)

  let domain_path = './uploads/' + Date.now() + 'domain.pddl'
  let problem_path = './uploads/' + Date.now() + 'problem.pddl'


  fs.writeFileSync(domain_path, toPDDL_domain(model));
  fs.writeFileSync(problem_path, toPDDL_problem(model));;

  let plan_run = create_base_plan_run('run-' + Date.now(), model, domain_path, problem_path);

  res.status(201).send({id: plan_run.id, status: plan_run.status});

  agenda.now('planner call', [plan_run, req.body.callback])
  
});


plannerRouter.post('/temp-goals', auth, async (req: Request, res: Response) => {

  console.log(req.body)

  let model = JSON.parse(req.body.model as string)
  let temp_goals = req.body.temp_goals as string

  let domain_path = './uploads/' + Date.now() + 'domain.pddl'
  let problem_path = './uploads/' + Date.now() + 'problem.pddl'
  let temp_goals_path = './uploads/' + Date.now() + 'temp_goals.json'


  fs.writeFileSync(domain_path, toPDDL_domain(model));
  fs.writeFileSync(problem_path, toPDDL_problem(model));
  fs.writeFileSync(temp_goals_path, temp_goals)

  let plan_run = create_temp_goal_plan_run('run-' + Date.now(), model, domain_path, problem_path, temp_goals_path);

  res.status(201).send({id: plan_run.id, status: plan_run.status});

  agenda.now('planner call', [plan_run, req.body.callback])
  
});