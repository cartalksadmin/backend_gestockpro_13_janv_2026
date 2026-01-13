
export type PaymentMethod = 'STRIPE' | 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO';

export class PaymentGateway {
  static async initializePayment(method: PaymentMethod, amount: number, currency: string, metadata: any) {
    console.log(`Initialisation paiement ${method} pour ${amount}${currency}`);
    
    // Switch selon le provider
    switch (method) {
      case 'STRIPE':
        return { type: 'REDIRECT', url: 'https://checkout.stripe.com/...' };
      case 'WAVE':
      case 'ORANGE_MONEY':
      case 'MTN_MOMO':
        return { type: 'WEBHOOK_WAIT', provider_ref: `REF-${Date.now()}` };
      default:
        throw new Error('Méthode non supportée');
    }
  }
}
