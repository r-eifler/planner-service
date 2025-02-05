import express, { Express, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import { create_temp_goal_plan_run } from '../run_planner';
import { agenda } from '..';
import { auth } from '../middleware/auth';
import { setupExperimentEnvironment } from '../experiment_utils';
import { PlannerRequest } from '../domain/service_communication';

var kill = require('tree-kill');

export const plannerRouter = express.Router();


plannerRouter.get('/:id', auth, async (req: Request, res: Response) => {

    // TODO return status of run with id 

    res.status(201).send("TODO");
});


plannerRouter.post('/plan', auth, async (req: Request, res: Response) => {

  try{

    const request = req.body as PlannerRequest

    if(process.env.DEBUG){
      console.log(request);
    }

    let model = request.model;
    const refId = request.id;

    setupExperimentEnvironment(model, {plan_properties: request.goals, hard_goals: request.hardGoals, soft_goals: []}, refId);

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
    res.status(201).send();
  }
  catch(err){
    console.log(err);
    res.status(500).send();
  }
});