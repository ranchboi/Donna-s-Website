# Payment Integration Guide for $5 Deposit System

## Overview
To implement the $5 deposit system for Donna Salon & Spa, you'll need to integrate with a payment processor that can handle small transactions and refunds.

## Recommended Payment Processors

### 1. **Stripe (Recommended)**
- **Setup Required**: Stripe business account
- **Benefits**: 
  - Easy refund handling
  - Strong security (PCI compliant)
  - Good documentation
  - Supports small amounts
- **Fees**: 2.9% + 30¢ per transaction
- **Cost for $5 deposit**: ~$0.45 per transaction

### 2. **Square**
- **Setup Required**: Square business account
- **Benefits**: 
  - Integrated with many POS systems
  - Easy refund process
- **Fees**: 2.9% + 30¢ per transaction
- **Cost for $5 deposit**: ~$0.45 per transaction

### 3. **PayPal Business**
- **Setup Required**: PayPal business account
- **Benefits**: 
  - Customers already familiar with PayPal
  - Good mobile experience
- **Fees**: 2.9% + 30¢ per transaction
- **Cost for $5 deposit**: ~$0.45 per transaction

## Implementation Steps

### Step 1: Choose and Setup Payment Processor
1. **Sign up** for a business account with your chosen processor
2. **Verify your business** (may require tax ID, bank account)
3. **Get API keys** (test and live environment)

### Step 2: Banking Requirements
- **Business Bank Account**: Required for receiving payments
- **Business Verification**: Tax ID/EIN, business license
- **Processing Time**: 1-7 business days for account approval

### Step 3: Technical Integration

#### For CashApp Integration:
```javascript
// Example: Stripe integration for CashApp-style payments
const stripe = Stripe('pk_test_your_publishable_key');

async function processCashAppDeposit() {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        // Payment details from form
    });
    
    if (!error) {
        // Send to your backend to process $5 charge
        fetch('/process-deposit', {
            method: 'POST',
            body: JSON.stringify({
                payment_method: paymentMethod.id,
                amount: 500, // $5.00 in cents
                currency: 'usd',
                appointment_id: appointmentId
            })
        });
    }
}
```

#### Backend Endpoint Example (Node.js):
```javascript
app.post('/process-deposit', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500, // $5.00 in cents
            currency: 'usd',
            payment_method: req.body.payment_method,
            confirmation_method: 'manual',
            confirm: true,
            metadata: {
                appointment_id: req.body.appointment_id,
                type: 'deposit'
            }
        });
        
        res.json({ success: true, payment_intent: paymentIntent });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});
```

### Step 4: Refund Process

#### Automatic Refund on Check-in:
```javascript
// When customer arrives for appointment
app.post('/refund-deposit', async (req, res) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: req.body.payment_intent_id,
            amount: 500, // Full $5.00 refund
            reason: 'requested_by_customer',
            metadata: {
                reason: 'customer_arrived_for_appointment'
            }
        });
        
        res.json({ success: true, refund: refund });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});
```

## QR Code Integration

### For CashApp:
- **CashApp for Business**: Set up business account
- **QR Code**: Generate payment QR with $5 amount
- **Webhook**: Set up notifications for payments received

### For PayPal:
- **PayPal Business**: Upgrade to business account
- **QR Code**: Use PayPal QR code generator
- **Integration**: PayPal SDK for web payments

### For Zelle:
- **Business Account**: Set up Zelle for Business
- **Manual Process**: Customer sends $5 to your Zelle number
- **Tracking**: Manual verification (screenshot or confirmation)

## Security Considerations

1. **PCI Compliance**: Never store card data on your servers
2. **HTTPS**: All payment pages must use SSL
3. **Webhook Verification**: Verify all webhook signatures
4. **Refund Tracking**: Keep detailed logs of all deposits and refunds

## Cost Analysis

### Monthly Costs (assuming 100 appointments):
- **Processing Fees**: $45 (100 × $0.45)
- **Refunds**: Usually free or minimal fee
- **Net Cost**: ~$45/month for deposit processing

### Benefits:
- **Reduced No-shows**: Customers more likely to honor appointments
- **Professional Image**: Shows you value your time
- **Cash Flow**: Small revenue stream if customers no-show

## Next Steps

1. **Choose a payment processor** (Stripe recommended)
2. **Set up business account** and get verified
3. **Integrate payment processing** into your booking system
4. **Test thoroughly** with small amounts
5. **Train staff** on refund process
6. **Update policies** and customer communications

## Alternative: Manual Process

If you prefer to start simple:
1. **Collect $5 via existing QR codes**
2. **Manual tracking** in a spreadsheet
3. **Manual refunds** when customers arrive
4. **Upgrade to automated system** as volume grows

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **PayPal Developer**: https://developer.paypal.com
- **Square Developer**: https://developer.squareup.com

---

**Important**: Test all payment flows thoroughly before going live. Start with test/sandbox environments to ensure everything works correctly.


