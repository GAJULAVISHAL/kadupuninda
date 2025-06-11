import prisma from "../lib/prisma";
import { startOfDay, endOfDay } from 'date-fns';

export async function createOrder(req:any, res:any){
    try {
        const {
            customerId,
            mealQuantity,
            mealSplit, // 'lunch', 'dinner', 'both'
            totalAmount,
            paymentId
        } = req.body;

        if (!customerId || !mealQuantity || !mealSplit || !totalAmount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newOrder = await prisma.order.create({
            data: {
                customerId,
                mealQuantity,
                mealSplit,
                totalAmount,
                paymentId,
                paymentStatus: 'pending',
                orderStatus: 'active',
            }
        });

        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const getTodayOrders = async (req:any, res:any) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true, 
        deliveries: true, 
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching today’s orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getAllOrders = async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        deliveries: true,
      },
    });
    console.log("🔍 Total Orders Found:", orders.length);
    console.log("🧾 Orders Data:", orders);
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
