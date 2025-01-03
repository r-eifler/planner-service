import express, { Express, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import { create_temp_goal_plan_run } from '../run_planner';
import { agenda } from '..';
import { auth } from '../middleware/auth';
import { setupExperimentEnvironment } from '../experiment_utils';

var kill = require('tree-kill');


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



// plannerRouter.post('/', auth, async (req: Request, res: Response) => {

//   try{

//     let model = JSON.parse(req.body.model as string)

//     let domain_path = './uploads/' + Date.now() + 'domain.pddl'
//     let problem_path = './uploads/' + Date.now() + 'problem.pddl'


//     fs.writeFileSync(domain_path, toPDDL_domain(model));
//     fs.writeFileSync(problem_path, toPDDL_problem(model));;

//     let plan_run = create_base_plan_run('run-' + Date.now(), model, domain_path, problem_path);

//     res.status(201).send({id: plan_run.id, status: plan_run.status});

//     agenda.now('planner call', [plan_run, req.body.callback])

//   }
//   catch(err){
//     console.log(err);
//     res.status(500).send();
//   }
  
// });


plannerRouter.post('/temp-goals', auth, async (req: Request, res: Response) => {

  try{

    let model = JSON.parse(req.body.model as string)
    let temp_goals = req.body.temp_goals as string
    const refId = req.body.id as string;

    setupExperimentEnvironment(model, temp_goals, refId);

    let plan_run = create_temp_goal_plan_run(refId, model);

    res.status(201).send({id: plan_run.id, status: plan_run.status});

    agenda.now('planner call', [refId, plan_run, req.body.callback])

  }
  catch(err){
    console.log(err);
    res.status(500).send();
  }
  
});

plannerRouter.post('/cancel', auth, async (req: Request, res: Response) => {

  try{
    const refId = req.body.id;
    console.log("Cancel: " + refId)

    const jobs = await agenda.jobs({name: 'planner call'});
    // console.log(jobs.map(d => d['attrs']));

    const cancelJob = jobs.filter(j => j['attrs'].data[0] === refId)[0];

    if (cancelJob === undefined){
      console.log("Job to cancel does not exist.");
      return res.status(400).send();
    }

    console.log("Cancel Process: " + cancelJob.attrs.data[3]);
    cancelJob.cancel();
    kill(cancelJob.attrs.data[3], 'SIGKILL');
    // console.log(cancelJob);
    // const result = await cancelJob.remove();
    // console.log("Canceled: " + result);
    res.status(201).send();
  }
  catch(err){
    console.log(err);
    res.status(500).send();
  }
});