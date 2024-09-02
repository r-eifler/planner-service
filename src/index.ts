import express from 'express';
import { plannerRouter } from './routes/planner';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/plan', plannerRouter);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});