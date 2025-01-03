import express from 'express';
import { plannerRouter } from './routes/planner';
import { Agenda } from "@hokify/agenda";
import { PlanRun, schedule_run } from './run_planner';
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PLANNER_SERVICE_PORT || 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/plan', plannerRouter);

console.log(process.env.PLANNER_SERVICE_PLANNER)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


const mongodbURL = process.env.PLANNER_MONGO_DB || 'localhost:27017/agenda-planner';
console.log("database: " + mongodbURL)

const concurrentRuns = Number(process.env.CONCURRENT_PLANNER_RUNS) || 1;

export const agenda = new Agenda({
  db: {address: mongodbURL, collection: 'agendaJobs'},
  processEvery: '5 seconds',
  maxConcurrency: concurrentRuns,
  defaultConcurrency: concurrentRuns,
});

agenda.start().then(
  () => console.log("Job scheduler started!"),
  () => console.log("Job scheduler failed!")
);

agenda.define('planner call', async job => {
  let plan_run = job.attrs.data[0] as PlanRun;
  let callback  = job.attrs.data[1]as string
  console.log("Schedule job: " + plan_run.id);
  schedule_run(plan_run, callback);
});

