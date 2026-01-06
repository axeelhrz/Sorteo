# Payment Flow Documentation

## Overview
This document describes the complete payment flow for the Sorteos application, from ticket purchase to payment confirmation.

## Payment Flow Steps

### 1. User Initiates Purchase
**Location:** `BuyTicketsBlock.tsx` or raffle detail page
- User selects quantity of tickets
- Clicks "Continuar con la compra" button
- System validates:
  - User is authenticated
  - Raffle is active
  - Requested quantity is available

### 2. Create Pending Payment
**API Endpoint:** `POST /api/payments`
**Service:** `paymentService.createPayment()`

**Request:**
```typescript
{
  raffleId: string,
  amount: number,
  ticketQuantity: number
}
```

**Response:**
```typescript
{
  id: string,
  raffleId: string,
  amount: number,
  ticketQuantity: number,
  status: 'pending',
  createdAt: string,
  updatedAt: string
}
```

**What happens:**
- Creates a new payment document in Firestore
- Status is set to `pending`
- Payment ID is generated
- Timestamps are recorded

### 3. Redirect to Checkout
**Location:** `/checkout?paymentId={paymentId}`
- User is redirected to checkout page with payment ID
- Payment details are loaded from Firestore

### 4. Checkout Page
**Location:** `checkout/page.tsx`

**Features:**
- Displays payment summary (tickets, amount)
- Shows payment method options (YAPE, PLIN, DALE)
- Displays QR codes and phone number for payment
- Provides voucher upload functionality

**User Actions:**
1. Select payment method (YAPE, PLIN, or DALE)
2. Make payment via selected method
3. Upload payment voucher (screenshot/photo)
4. Click "Confirmar pago y enviar comprobante"

### 5. Confirm Payment with Voucher
**API Endpoint:** `POST /api/payments/confirm-with-voucher`
**Service:** `paymentService.confirmPaymentWithVoucher()`

**Request (FormData):**
```typescript
{
  voucher: File,
  paymentId: string,
  paymentMethod: 'yape' | 'plin' | 'dale',
  amount: string,
  ticketQuantity: string
}
```

**What happens:**
- Validates voucher file (type, size)
- Uploads voucher to Firebase Storage (`vouchers/{paymentId}_{timestamp}_{filename}`)
- Updates payment document:
  - Status: `pending_validation`
  - Stores voucher URL
  - Records payment method
  - Adds upload timestamp

**Response:**
```typescript
{
  id: string,
  status: 'pending_validation',
  paymentMethod: string,
  voucherUrl: string,
  voucherUploadedAt: string,
  updatedAt: string,
  message: 'Comprobante subido exitosamente. Tu pago será validado pronto.'
}
```

### 6. Payment Success Page
**Location:** `/payment-success?paymentId={paymentId}&pending=true`
- Shows success message
- Informs user that payment is pending validation
- Provides next steps information

### 7. Admin Validation (Manual Process)
**Location:** Admin panel (to be implemented)
- Admin reviews uploaded vouchers
- Verifies payment amount matches
- Approves or rejects payment

**API Endpoints (for future implementation):**
- `GET /api/payments/pending-validation` - Get all pending payments
- `POST /api/payments/{id}/validate` - Approve/reject payment

### 8. Payment Completion
Once validated by admin:
- Payment status changes to `completed`
- Raffle tickets are assigned to user
- User receives confirmation email
- Tickets appear in user's dashboard

## Alternative Flow: Payment Cancellation

### User Cancels Payment
**Location:** Checkout page
- User clicks "Cancelar compra" button
- Triggers payment failure flow

**API Endpoint:** `POST /api/payments/{id}/fail`
**Service:** `paymentService.failPayment()`

**Request:**
```typescript
{
  failureReason: string
}
```

**What happens:**
- Updates payment status to `failed`
- Records failure reason
- Adds failure timestamp

**Redirect:** `/payment-failed?paymentId={paymentId}`

## Payment Statuses

| Status | Description |
|--------|-------------|
| `pending` | Payment created, awaiting user action |
| `pending_validation` | Voucher uploaded, awaiting admin validation |
| `completed` | Payment validated and completed |
| `failed` | Payment cancelled or rejected |
| `refunded` | Payment refunded to user |

## API Routes Summary

### Created Routes
1. **POST /api/payments** - Create new payment
2. **GET /api/payments** - Get all payments (placeholder)
3. **GET /api/payments/{id}** - Get payment by ID
4. **POST /api/payments/confirm** - Confirm payment (direct)
5. **POST /api/payments/confirm-with-voucher** - Confirm with voucher upload
6. **POST /api/payments/{id}/fail** - Mark payment as failed

### Routes to Implement
1. **GET /api/payments/pending-validation** - Get pending payments (admin)
2. **POST /api/payments/{id}/validate** - Validate payment (admin)
3. **GET /api/payments/user/me** - Get current user's payments
4. **GET /api/payments/raffle/{raffleId}** - Get payments for a raffle
5. **POST /api/payments/{id}/refund** - Refund a payment

## Firebase Collections

### payments
```typescript
{
  id: string,
  raffleId: string,
  userId: string, // To be added
  amount: number,
  ticketQuantity: number,
  status: 'pending' | 'pending_validation' | 'completed' | 'failed' | 'refunded',
  paymentMethod?: 'yape' | 'plin' | 'dale',
  voucherUrl?: string,
  transactionId?: string,
  failureReason?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  voucherUploadedAt?: Timestamp,
  completedAt?: Timestamp,
  failedAt?: Timestamp
}
```

## Security Considerations

1. **Authentication:** All API routes check for Bearer token
2. **Authorization:** Users can only access their own payments
3. **File Validation:** Vouchers are validated for type and size
4. **Storage Security:** Vouchers stored in Firebase Storage with proper rules

## Next Steps

1. **Add User ID tracking:** Associate payments with authenticated users
2. **Implement admin validation:** Create admin panel for payment review
3. **Add email notifications:** Notify users of payment status changes
4. **Implement ticket assignment:** Automatically assign tickets on payment completion
5. **Add payment history:** Allow users to view their payment history
6. **Implement refund flow:** Handle payment refunds
7. **Add OCR validation:** Automatically validate voucher amounts using OCR

## Testing the Flow

1. Start the development server: `npm run dev`
2. Navigate to a raffle detail page
3. Click "Comprar tickets"
4. Select quantity and click "Continuar con la compra"
5. Select payment method on checkout page
6. Upload a test voucher image
7. Click "Confirmar pago y enviar comprobante"
8. Verify redirect to success page
9. Check Firestore for payment document with `pending_validation` status
10. Check Firebase Storage for uploaded voucher

## Troubleshooting

### 404 Error on /api/payments
- Ensure Next.js server is restarted after creating API routes
- Check that API routes are in correct directory structure
- Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Voucher Upload Fails
- Check Firebase Storage rules allow authenticated uploads
- Verify file size is under 5MB
- Ensure file type is image (JPG, PNG, WEBP)

### Payment Not Created
- Check browser console for errors
- Verify user is authenticated (token in localStorage)
- Check Firestore rules allow write access to payments collection