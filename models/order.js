const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    products: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    user: {
      email: {
        type: String,
        required: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
    billingDetails: {
      firstName: {
        type: String,
        required: false,
      },
      lastName: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      pincode: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { Timestamp: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
