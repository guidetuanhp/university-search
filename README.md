# University Search Portal API 🎓

A comprehensive API for searching and exploring university information worldwide. This project provides a powerful search system with a database containing thousands of universities from around the globe.

## 🌟 Key Features

- 🔍 **Advanced Search**: Search by university name, location, institution type
- 🌍 **Global Database**: Information from universities worldwide
- 📱 **Responsive Design**: Optimized performance on all devices
- ⚡ **High Performance**: Optimized search with pagination and caching
- 🎯 **Detailed Information**: Complete profiles of each university
- 📊 **Statistics**: Overview of global higher education landscape
- 🔒 **Security**: Rate limiting, validation and security headers
- 💾 **Smart Caching**: Enhanced API response speed

## 🚀 Base URL

```
https://apiuniversity.gkorean.com/
```

## 📚 API Usage Guide

### 1. University Search

Search universities with various criteria.

**Endpoint:** `GET /api/universities/search`

**Parameters:**
| Parameter | Type | Description | Example |
|---------|------|-------|-------|
| `search` | string | General search keywords | "computer science", "engineering" |
| `name` | string | University name | "Harvard", "Stanford" |
| `country` | string | Country name | "Vietnam", "United States" |
| `city` | string | City name | "Hanoi", "New York" |
| `type` | string | Institution type | "University", "College" |
| `status` | string | Operating status | "Active", "Inactive" |
| `page` | number | Page number (default: 1) | 1, 2, 3... |
| `limit` | number | Results per page (default: 20, max: 100) | 10, 20, 50 |
| `sortBy` | string | Sort by field | "name", "country", "city", "updated" |
| `sortOrder` | string | Sort order | "asc", "desc" |

**Usage Examples:**

```bash
# Basic search
curl -X GET "https://apiuniversity.gkorean.com/api/universities/search?search=computer science"

# Search by country
curl -X GET "https://apiuniversity.gkorean.com/api/universities/search?country=Vietnam"

# Advanced search with multiple parameters
curl -X GET "https://apiuniversity.gkorean.com/api/universities/search?name=harvard&country=United States&limit=10&sortBy=name"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "institution": {
        "name": "Harvard University",
        "short_name": "Harvard",
        "iau_id": "HU001",
        "country_line": "United States"
      },
      "general_information": {
        "address": {
          "city": "Cambridge",
          "country": "United States"
        },
        "type": "University",
        "status": "Active",
        "established": "1636"
      },
      "student_staff_numbers": {
        "total_students": "22000"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63,
    "hasNext": true,
    "hasPrev": false
  },
  "query": {
    "search": null,
    "country": "United States",
    "city": null,
    "name": "harvard",
    "type": null,
    "status": null
  },
  "count": 1
}
```

### 2. Get University Details

Get complete information for a specific university.

**Endpoint:** `GET /api/universities/:id`

**Parameters:**
- `id`: ObjectId or IAU ID of the university

**Examples:**
```bash
# Using ObjectId
curl -X GET "https://apiuniversity.gkorean.com/api/universities/507f1f77bcf86cd799439011"

# Using IAU ID
curl -X GET "https://apiuniversity.gkorean.com/api/universities/HU001"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "institution": {
      "name": "Harvard University",
      "short_name": "Harvard",
      "iau_id": "HU001",
      "country_line": "United States",
      "updated_on": "2025-01-15T08:30:00.000Z"
    },
    "general_information": {
      "address": {
        "street": "Massachusetts Hall",
        "city": "Cambridge",
        "state": "Massachusetts",
        "country": "United States",
        "postal_code": "02138"
      },
      "type": "University",
      "status": "Active",
      "established": "1636",
      "website": "https://www.harvard.edu",
      "email": "info@harvard.edu",
      "phone": "+1-617-495-1000"
    },
    "student_staff_numbers": {
      "total_students": "22000",
      "international_students": "5500",
      "academic_staff": "2400"
    },
    "academic_information": {
      "faculties": ["Medicine", "Law", "Business", "Engineering"],
      "programs": ["Undergraduate", "Graduate", "Doctoral"],
      "languages": ["English"]
    }
  }
}
```

### 3. Search Suggestions (Autocomplete)

Get a list of university name suggestions as the user types.

**Endpoint:** `GET /api/universities/suggest`

**Parameters:**
| Parameter | Type | Description | Example |
|---------|------|-------|-------|
| `q` | string | Search query (minimum 2 characters) | "harv", "stan" |
| `limit` | number | Number of suggestions (default: 10, max: 20) | 5, 10, 15 |

**Example:**
```bash
curl -X GET "https://apiuniversity.gkorean.com/api/universities/suggest?q=harv&limit=5"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "institution": {
        "name": "Harvard University",
        "short_name": "Harvard",
        "iau_id": "HU001",
        "country_line": "United States"
      },
      "general_information": {
        "address": {
          "city": "Cambridge"
        }
      }
    }
  ],
  "count": 1
}
```

### 4. List of Countries

Get a list of all countries with universities in the database.

**Endpoint:** `GET /api/countries`

**Example:**
```bash
curl -X GET "https://apiuniversity.gkorean.com/api/countries"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    "Afghanistan",
    "Albania",
    "Algeria",
    "United States",
    "Vietnam",
    "...more countries"
  ],
  "count": 195
}
```

### 5. List of Cities

Get a list of cities with universities, optionally filtered by country.

**Endpoint:** `GET /api/cities`

**Parameters:**
| Parameter | Type | Description | Example |
|---------|------|-------|-------|
| `country` | string | Country name to filter cities | "Vietnam", "United States" |

**Examples:**
```bash
# All cities
curl -X GET "https://apiuniversity.gkorean.com/api/cities"

# Cities in a specific country
curl -X GET "https://apiuniversity.gkorean.com/api/cities?country=Vietnam"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    "Hanoi",
    "Ho Chi Minh City",
    "Da Nang",
    "Hue",
    "Can Tho"
  ],
  "count": 25,
  "country": "Vietnam"
}
```

### 6. Country Statistics

Get statistics on the number of universities by country.

**Endpoint:** `GET /api/stats/countries/all`

**Example:**
```bash
curl -X GET "https://apiuniversity.gkorean.com/api/stats/countries/all"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "United States",
      "count": 4500
    },
    {
      "_id": "China",
      "count": 2800
    },
    {
      "_id": "India",
      "count": 1200
    },
    {
      "_id": "Vietnam",
      "count": 235
    }
  ],
  "count": 195
}
```

### 7. General Statistics

Get general system statistics.

**Endpoint:** `GET /api/stats`

**Example:**
```bash
curl -X GET "https://apiuniversity.gkorean.com/api/stats"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalUniversities": 15750,
    "topCountries": [
      {"_id": "United States", "count": 4500},
      {"_id": "China", "count": 2800},
      {"_id": "India", "count": 1200}
    ],
    "institutionTypes": [
      {"_id": "University", "count": 8500},
      {"_id": "College", "count": 4200},
      {"_id": "Institute", "count": 2100}
    ],
    "recentlyUpdated": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "institution": {
          "name": "Harvard University",
          "country_line": "United States",
          "updated_on": "2025-01-15T08:30:00.000Z"
        }
      }
    ]
  }
}
```

## 🔧 Installation and Setup

### 1. System Requirements

- Node.js 16+ 
- MongoDB 4.4+
- NPM or Yarn

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd university-search

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy example configuration file
cp .env.example .env

# Edit .env with your information
```

**Environment Variables:**
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=university_db
COLLECTION_NAME=universities

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache settings
CACHE_TTL=300

# Environment
NODE_ENV=development
```

### 4. Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 Rate Limiting

The API has request limits to ensure performance:

- **Limit:** 100 requests/15 minutes/IP
- **Response Headers:**
  - `X-RateLimit-Limit`: Maximum limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (timestamp)

## 🔍 Error Codes and Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Data not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Format

```json
{
  "status": "error",
  "message": "Detailed error description",
  "code": "ERROR_CODE" // (optional)
}
```
## 🛠️ Technology Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with native driver
- **Security**: Helmet.js, CORS, Rate limiting
- **Performance**: Compression, Memory caching
- **Frontend**: Vanilla JavaScript, Modern CSS Grid/Flexbox
- **Validation**: Custom validation middleware
- **Logging**: Winston logger

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📄 License

This project is released under the [MIT License](LICENSE).

## 📞 Contact & Support

- **API URL**: https://apiuniversity.gkorean.com/
- **Issues**: Create an issue on the GitHub repository
- **Email**: support@gkorean.com

---

**Note**: This API is designed for educational and research purposes. Please use responsibly and respect rate limiting constraints.
