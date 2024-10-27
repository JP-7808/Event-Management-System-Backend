import Razorpay from 'razorpay';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: "rzp_live_Egt4Xg9w6VBRsl",
    key_secret: "BrFCbMGJSgKFbouMPegunZaP",
});

// Endpoint to create order
router.post('/create-order', async (req, res) => {
    const { amount } = req.body; // Get amount dynamically (e.g., event price)
    const options = {
        amount: amount * 100, // Razorpay amount is in paise
        currency: 'INR',
        receipt: `order_rcptid_${Date.now()}`
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

export default router;
