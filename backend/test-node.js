console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test if we can require basic modules
try {
  const express = require('express');
  console.log('✅ Express is available');
} catch (error) {
  console.log('❌ Express not found:', error.message);
}

try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose is available');
} catch (error) {
  console.log('❌ Mongoose not found:', error.message);
}

try {
  const dotenv = require('dotenv');
  console.log('✅ Dotenv is available');
} catch (error) {
  console.log('❌ Dotenv not found:', error.message);
}
