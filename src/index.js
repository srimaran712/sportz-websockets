import express from 'express';
import matchesRouter from './routes/matches.js';

const app = express();


app.use(express.json());

app.use('/matches', matchesRouter);
app.get('/', (req, res) => {
    res.send('Hello from the express server!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});