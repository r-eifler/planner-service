import express from 'express';
import { plannerRouter } from './routes/planner';
import { Agenda } from "@hokify/agenda";
import { PlanRun, schedule_run } from './run_planner';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/plan', plannerRouter);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



export const agenda = new Agenda({
  db: {address: 'localhost:27017/agenda-test', collection: 'agendaJobs'},
  processEvery: '2 seconds',
  maxConcurrency: 1,
  defaultConcurrency: 1,
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

