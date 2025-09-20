# Backend Integration Guide for Donna Salon & Spa Booking System

## Overview
This document outlines how to integrate the booking system with backend services for SMS notifications, email confirmations, and data persistence.

## Required Services

### 1. SMS Notifications (Twilio Integration)

#### Setup Twilio Account
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number

#### Backend API Endpoint
Create an endpoint `/api/send-sms` that accepts:
```json
{
  "to": "+14103707710",
  "message": "New appointment booked! Service: Package A - $300, Date: 1/15/2024 at 10:00 AM, Customer: Sarah Johnson, Phone: 410-555-0123"
}
```

#### Implementation Example (Node.js)
```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE, // Your Twilio number
      to: to
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Email Notifications (SendGrid/EmailJS)

#### For Customer Confirmations
```javascript
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  
  const msg = {
    to: to,
    from: 'noreply@donnasalonandspa.com',
    subject: subject,
    html: html
  };
  
  await sgMail.send(msg);
  res.json({ success: true });
});
```

### 3. Database Integration

#### Appointments Table Schema
```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  confirmation_number VARCHAR(20) UNIQUE,
  service VARCHAR(255),
  appointment_date DATE,
  appointment_time TIME,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blocked_times (
  id SERIAL PRIMARY KEY,
  block_date DATE,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints Needed

**POST /api/appointments** - Create new appointment
```javascript
app.post('/api/appointments', async (req, res) => {
  const appointment = await db.appointments.create(req.body);
  
  // Send SMS to Donna
  await sendSMS('+14103707710', `New appointment: ${appointment.service} on ${appointment.appointment_date}`);
  
  // Send confirmation email to customer
  await sendEmail(appointment.customer_email, 'Appointment Confirmation', confirmationHTML);
  
  res.json(appointment);
});
```

**GET /api/appointments** - Get appointments for admin panel
**PUT /api/appointments/:id** - Update appointment status
**POST /api/blocked-times** - Block time slots
**GET /api/availability/:date** - Check available times

### 4. Notification Types

#### For Donna (SMS to 410-370-7710):
- New booking: "New appointment booked! [details]"
- Cancellation: "Appointment cancelled: [details]"
- Rescheduling: "Appointment rescheduled: [details]"

#### For Customers (Email):
- Booking confirmation
- Appointment reminders (24 hours before)
- Cancellation confirmations
- Rescheduling confirmations

## Deployment Options

### Option 1: Vercel + Serverless Functions
1. Deploy frontend to Vercel
2. Use Vercel serverless functions for API
3. Connect to PostgreSQL database (Supabase/Neon)

### Option 2: Full Stack Platform
1. Use platforms like Railway, Render, or Heroku
2. Deploy complete Node.js backend
3. Include database in same deployment

### Option 3: Backend-as-a-Service
1. Use Firebase/Supabase for data + auth
2. Use Zapier/Make.com for notifications
3. Minimal backend coding required

## Environment Variables Needed

```env
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone_number
SENDGRID_API_KEY=your_sendgrid_key
DATABASE_URL=your_database_connection_string
ADMIN_PASSWORD=secure_admin_password
```

## Security Considerations

1. **Admin Password**: Store securely, use hashing
2. **Rate Limiting**: Prevent spam bookings
3. **Input Validation**: Sanitize all user inputs
4. **HTTPS**: Ensure all communications are encrypted
5. **API Keys**: Never expose in frontend code

## Testing Checklist

- [ ] Customer can book appointment
- [ ] Donna receives SMS notification
- [ ] Customer receives email confirmation
- [ ] Admin can view bookings
- [ ] Admin can approve/decline bookings
- [ ] Status changes trigger notifications
- [ ] Admin can block time slots
- [ ] Calendar updates properly
- [ ] Mobile responsive design works
- [ ] Form validation works properly

## Production Deployment Steps

1. Set up Twilio account and get credentials
2. Set up email service (SendGrid/EmailJS)
3. Deploy backend with database
4. Update frontend API endpoints
5. Test all notification flows
6. Deploy frontend to Vercel
7. Configure custom domain
8. Set up monitoring and alerts

## Cost Estimates

- **Twilio SMS**: ~$0.0075 per SMS
- **SendGrid Email**: Free tier: 100 emails/day
- **Database**: Supabase free tier or $25/month
- **Hosting**: Vercel free tier or $20/month
- **Total Monthly**: ~$10-50 depending on usage

## Support Contact

For implementation assistance, contact your developer or use this documentation to guide your backend developer through the integration process.


