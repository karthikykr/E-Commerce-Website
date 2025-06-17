const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'USA'
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: { unique: true, sparse: true }
  },
  mobile: {
    type: String,
    sparse: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    index: { unique: true, sparse: true }
  },
  adminId: {
    type: String,
    sparse: true,
    trim: true,
    index: { unique: true, sparse: true }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  authMethod: {
    type: String,
    enum: ['email', 'mobile', 'admin'],
    required: true,
    default: 'email'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  address: addressSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Custom validation for authentication methods
userSchema.pre('validate', function(next) {
  if (this.authMethod === 'email' && !this.email) {
    this.invalidate('email', 'Email is required for email authentication');
  }
  if (this.authMethod === 'mobile' && !this.mobile) {
    this.invalidate('mobile', 'Mobile number is required for mobile authentication');
  }
  if (this.authMethod === 'admin' && !this.adminId) {
    this.invalidate('adminId', 'Admin ID is required for admin authentication');
  }

  // Ensure unique identifier based on auth method
  if (this.authMethod === 'email' && this.email) {
    this.mobile = undefined;
    this.adminId = undefined;
  } else if (this.authMethod === 'mobile' && this.mobile) {
    this.email = undefined;
    this.adminId = undefined;
  } else if (this.authMethod === 'admin' && this.adminId) {
    this.email = undefined;
    this.mobile = undefined;
    this.role = 'admin'; // Force admin role for admin auth method
  }

  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
