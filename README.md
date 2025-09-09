# University Search Portal

A modern web application for searching and exploring university information from around the world.

## Features

- 🔍 **Advanced Search**: Search universities by name, location, type, and more
- 🌍 **Global Database**: Information from universities worldwide
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast Performance**: Optimized search with pagination and caching
- 🎯 **Detailed Information**: Complete university profiles with contact details
- 📊 **Statistics**: Overview of global higher education landscape

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: Vanilla JavaScript, Modern CSS
- **Security**: Helmet.js, Rate limiting
- **Performance**: Compression, Caching

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Start the server:
```bash
npm run dev
```

4. Open your browser and go to `http://localhost:3000`

## API Endpoints

- `GET /api/universities/search` - Search universities
- `GET /api/universities/:id` - Get university details
- `GET /api/countries` - Get list of countries
- `GET /api/cities` - Get list of cities
- `GET /api/stats` - Get statistics
- `GET /api/suggest` - Autocomplete suggestions

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=university_db
```

## License

MIT License
