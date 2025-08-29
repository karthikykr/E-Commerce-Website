const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "promotion",
        "order",
        "system",
      ],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String, // URL to redirect when notification is clicked
      maxlength: 200,
    },
    metadata: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
      customData: mongoose.Schema.Types.Mixed,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who sent the notification
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    expiresAt: {
      type: Date, // Optional expiration date for notifications
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Virtual for checking if notification is expired
notificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static method to create order-related notifications
notificationSchema.statics.createOrderNotification = async function (
  userId,
  orderId,
  type,
  customMessage,
) {
  const messages = {
    order_placed: "Your order has been placed successfully!",
    order_confirmed: "Your order has been confirmed and is being processed.",
    order_shipped: "Your order has been shipped and is on its way!",
    order_delivered: "Your order has been delivered successfully.",
    order_cancelled: "Your order has been cancelled.",
    payment_received: "Payment received for your order.",
    payment_failed: "Payment failed for your order. Please try again.",
  };

  const titles = {
    order_placed: "Order Placed",
    order_confirmed: "Order Confirmed",
    order_shipped: "Order Shipped",
    order_delivered: "Order Delivered",
    order_cancelled: "Order Cancelled",
    payment_received: "Payment Received",
    payment_failed: "Payment Failed",
  };

  const notification = new this({
    user: userId,
    title: titles[type] || "Order Update",
    message:
      customMessage || messages[type] || "Your order status has been updated.",
    type:
      type.includes("failed") || type.includes("cancelled")
        ? "error"
        : type.includes("delivered") || type.includes("received")
          ? "success"
          : "info",
    actionUrl: `/orders/${orderId}`,
    metadata: {
      orderId: orderId,
    },
  });

  return await notification.save();
};

// Static method to create product-related notifications
notificationSchema.statics.createProductNotification = async function (
  userId,
  productId,
  type,
  customMessage,
) {
  const messages = {
    back_in_stock: "A product in your wishlist is back in stock!",
    price_drop: "Price dropped for a product in your wishlist!",
    new_review: "New review added to a product you purchased.",
    low_stock: "Hurry! Limited stock remaining for this product.",
  };

  const titles = {
    back_in_stock: "Back in Stock",
    price_drop: "Price Drop Alert",
    new_review: "New Review",
    low_stock: "Low Stock Alert",
  };

  const notification = new this({
    user: userId,
    title: titles[type] || "Product Update",
    message: customMessage || messages[type] || "Product update available.",
    type:
      type === "price_drop" || type === "back_in_stock" ? "success" : "info",
    actionUrl: `/products/${productId}`,
    metadata: {
      productId: productId,
    },
  });

  return await notification.save();
};

// Static method to create promotional notifications
notificationSchema.statics.createPromotionalNotification = async function (
  userId,
  title,
  message,
  actionUrl,
  metadata,
) {
  const notification = new this({
    user: userId,
    title: title,
    message: message,
    type: "promotion",
    actionUrl: actionUrl,
    metadata: metadata,
    priority: "high",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire in 7 days
  });

  return await notification.save();
};

// Static method to send bulk notifications
notificationSchema.statics.sendBulkNotifications = async function (
  userIds,
  notificationData,
) {
  const notifications = userIds.map((userId) => ({
    user: userId,
    ...notificationData,
  }));

  return await this.insertMany(notifications);
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Pre-save middleware to set default expiration for promotional notifications
notificationSchema.pre("save", function (next) {
  if (this.type === "promotion" && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);
