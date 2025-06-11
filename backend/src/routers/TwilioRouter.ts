import  express  from "express";
import { Success_Payment } from "../controllers/TwilioController";
export const TwilioRouter = express.Router();

TwilioRouter.post('/payment-success',Success_Payment);