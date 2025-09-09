require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    console.log('Đang kiểm tra kết nối MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('Đang kết nối...');
    await client.connect();
    console.log('✓ Kết nối thành công!');
    
    const db = client.db(process.env.DATABASE_NAME);
    const collections = await db.listCollections().toArray();
    console.log('✓ Có thể truy cập database:', process.env.DATABASE_NAME);
    console.log('Collections có sẵn:', collections.map(c => c.name));
    
    await client.close();
    console.log('✓ Đóng kết nối thành công');
    
  } catch (error) {
    console.error('✗ Lỗi kết nối:', error.message);
    console.error('Chi tiết lỗi:', error.name);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Gợi ý: Kiểm tra kết nối internet');
    } else if (error.message.includes('Authentication failed')) {
      console.log('💡 Gợi ý: Kiểm tra username/password MongoDB Atlas');
    } else if (error.message.includes('not authorized')) {
      console.log('💡 Gợi ý: Kiểm tra IP whitelist trên MongoDB Atlas');
    }
  }
}

testConnection();
