const http = require('http');

console.log('📂 GETTING AVAILABLE CATEGORIES\n');

const getCategories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data.categories) {
            resolve(response.data.categories);
          } else {
            reject(new Error('Failed to get categories'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const main = async () => {
  try {
    const categories = await getCategories();
    console.log('✅ Available Categories:');
    console.log('='.repeat(50));
    
    categories.forEach((cat, i) => {
      console.log(`${i+1}. ${cat.name}`);
      console.log(`   ID: ${cat._id}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log('');
    });

    console.log(`📊 Total Categories: ${categories.length}`);
    console.log('\n🔗 Use any of these category IDs for product creation/editing');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

main();
