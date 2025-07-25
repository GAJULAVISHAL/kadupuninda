// src/controllers/WhatsAppController.ts

import prisma from '../lib/prisma';

export async function handleWhatsAppWebhook(req: any, res: any) {
  const { from, text } = req.body;

  try {
    await prisma.whatsAppResponse.create({
      data: {
        from,
        message: text.body,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    res.sendStatus(500);
  }
}

export async function getWhatsAppResponses(req: any, res: any) {
  try {
    const responses = await prisma.whatsAppResponse.findMany({
      orderBy: {
        createdAt: 'desc', // Show the newest messages first
      },
    });
    res.status(200).json({ success: true, responses: responses });
  } catch (error) {
    console.error('Error fetching WhatsApp responses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}