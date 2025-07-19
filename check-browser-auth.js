// 🔐 BROWSER AUTHENTICATION CHECKER
// Copy and paste this code into your browser console (F12 → Console)
// to check if authentication tokens are properly stored

console.log('🔐 CHECKING BROWSER AUTHENTICATION STATE\n');

// Check cookies
console.log('🍪 Checking Cookies:');
const authTokenCookie = document.cookie
  .split('; ')
  .find(row => row.startsWith('auth-token='));
const userDataCookie = document.cookie
  .split('; ')
  .find(row => row.startsWith('user-data='));

if (authTokenCookie) {
  const token = authTokenCookie.split('=')[1];
  console.log('✅ Auth token found in cookies:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No auth token found in cookies');
}

if (userDataCookie) {
  const userData = userDataCookie.split('=')[1];
  try {
    const user = JSON.parse(decodeURIComponent(userData));
    console.log('✅ User data found in cookies:', user.name, '(' + user.email + ')');
  } catch (e) {
    console.log('⚠️ User data found but corrupted in cookies');
  }
} else {
  console.log('❌ No user data found in cookies');
}

// Check localStorage
console.log('\n💾 Checking localStorage:');
const tokenLS = localStorage.getItem('token');
const userLS = localStorage.getItem('user');

if (tokenLS) {
  console.log('✅ Auth token found in localStorage:', tokenLS.substring(0, 20) + '...');
} else {
  console.log('❌ No auth token found in localStorage');
}

if (userLS) {
  try {
    const user = JSON.parse(userLS);
    console.log('✅ User data found in localStorage:', user.name, '(' + user.email + ')');
  } catch (e) {
    console.log('⚠️ User data found but corrupted in localStorage');
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Overall status
console.log('\n📊 AUTHENTICATION STATUS:');
const hasToken = authTokenCookie || tokenLS;
const hasUser = userDataCookie || userLS;

if (hasToken && hasUser) {
  console.log('✅ AUTHENTICATED - You should be able to use cart operations');
} else if (!hasToken && !hasUser) {
  console.log('❌ NOT AUTHENTICATED - Please login first');
  console.log('🔗 Login URL: http://localhost:3000/auth/login');
  console.log('📧 Email: democustomer1752824171872@gruhapaaka.com');
  console.log('🔑 Password: democustomer123');
} else {
  console.log('⚠️ PARTIAL AUTHENTICATION - Some data is missing');
  console.log('💡 Try logging out and logging in again');
}

// Instructions
console.log('\n🔧 IF YOU SEE AUTHENTICATION ISSUES:');
console.log('1. 🔐 Login at: http://localhost:3000/auth/login');
console.log('2. 🔄 Refresh the cart page after login');
console.log('3. 🧹 If still issues, clear storage and login again:');
console.log('   localStorage.clear(); document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));');
console.log('4. 🛒 Then try cart operations');

console.log('\n✅ Cart operations now have better error messages!');
console.log('✅ You will see "Please login again" if token is missing');
