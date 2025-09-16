const { MongoClient } = require('mongodb');

// Netlify Functions for cloud data storage
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// MongoDB connection (you can also use Netlify's built-in database)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bankmate';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('bankmate');
  cachedDb = db;
  return db;
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, path, body, headers: requestHeaders } = event;
    const db = await connectToDatabase();
    
    // Extract user ID from authorization header
    const authHeader = requestHeaders.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const pathParts = path.split('/').filter(Boolean);
    const collection = pathParts[pathParts.length - 1]; // Get collection name from path
    
    switch (httpMethod) {
      case 'GET':
        // Get all data for user
        const data = await db.collection(collection).find({ userId }).toArray();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };

      case 'POST':
        // Create new data
        const newData = JSON.parse(body);
        const result = await db.collection(collection).insertOne({
          ...newData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ id: result.insertedId, ...newData })
        };

      case 'PUT':
        // Update existing data
        const updateData = JSON.parse(body);
        const { id, ...updateFields } = updateData;
        await db.collection(collection).updateOne(
          { _id: id, userId },
          { $set: { ...updateFields, updatedAt: new Date() } }
        );
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };

      case 'DELETE':
        // Delete data
        const deleteData = JSON.parse(body);
        await db.collection(collection).deleteOne({ _id: deleteData.id, userId });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};