
import axios from 'axios';

export class NotificationService {
  static async send(type: 'EMAIL' | 'SLACK' | 'SMS', recipient: string, data: any) {
    const webhookUrl = process.env.N8N_NOTIF_WEBHOOK;
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, {
        channel: type,
        to: recipient,
        payload: data,
        timestamp: new Date()
      });
      console.log(`Notification ${type} envoyée à ${recipient}`);
    } catch (e) {
      console.error('Notification dispatch failed');
    }
  }

  static async alertStockLow(productName: string, current: number, email: string) {
    await this.send('EMAIL', email, {
      subject: `Alerte Stock : ${productName}`,
      message: `Le niveau de stock est critique (${current}). Veuillez réapprovisionner.`
    });
  }
}
