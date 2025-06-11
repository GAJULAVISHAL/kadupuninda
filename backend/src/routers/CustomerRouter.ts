import express from "express";
import { createCustomer } from "../controllers/CustomerController";
export const customerRouter = express.Router();

customerRouter.post('/create',createCustomer);