import  express  from "express";
import { createOrder } from "../controllers/OrderController";
import { getTodayOrders } from '../controllers/OrderController';

export const OrderRouter = express.Router();

OrderRouter.post('/createOrder',createOrder)
OrderRouter.get('/today',getTodayOrders)