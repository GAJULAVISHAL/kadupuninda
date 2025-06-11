import express from 'express';
import cors from 'cors';
import { OrderRouter } from './routers/OrderRouter';
import { MenuRouter } from './routers/MenuRouter';
import { customerRouter } from './routers/CustomerRouter';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/menu',MenuRouter);
app.use('/api/v1/order',OrderRouter)
app.use('/api/v1/customer',customerRouter)
app.use('/api/v1/twilio',customerRouter)

app.listen(process.env.PORT || 4010, () => {
    console.log('Server is running on port 4010');
});