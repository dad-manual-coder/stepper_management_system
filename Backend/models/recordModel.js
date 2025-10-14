import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'sale', 'swap-up', etc.
    customerName: { type: String },
    supplierName: { type: String },
    
    
    phoneSold: { type: String },

    
    phoneGiven: { type: String },
    phoneReceived: { type: String },
    
    
   
    amountPaid: { type: Number, default: 0 }, 
    amountSellerPaid: { type: Number, default: 0 }, 

    
    phoneNames: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    totalAmount: { type: Number }, 

    paymentStatus: { type: String, required: true },
    date: { type: Date, required: true },
}, {
    timestamps: true, 
});

const Record = mongoose.model('Record', recordSchema);

export default Record;
