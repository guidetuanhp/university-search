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

## 💡 Efficient API Usage Tips

### 1. Optimize Search

```javascript
// ✅ Good - Use specific parameters
const response = await fetch('https://apiuniversity.gkorean.com/api/universities/search?country=Vietnam&type=University&limit=20');

// ❌ Avoid - Too generic search
const response = await fetch('https://apiuniversity.gkorean.com/api/universities/search?search=university');
```

### 2. Efficient Pagination

```javascript
// Get first page
let page = 1;
const limit = 20;

const getUniversities = async (page) => {
  const response = await fetch(`https://apiuniversity.gkorean.com/api/universities/search?page=${page}&limit=${limit}`);
  const data = await response.json();
  return data;
};

// Handle pagination
const loadMore = async () => {
  const data = await getUniversities(page);
  if (data.pagination.hasNext) {
    page++;
    // Load next page
  }
};
```

### 3. Use Caching

```javascript
// Cache results
const cache = new Map();

const searchWithCache = async (query) => {
  const cacheKey = JSON.stringify(query);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await fetch(`https://apiuniversity.gkorean.com/api/universities/search?${new URLSearchParams(query)}`);
  const data = await response.json();
  
  cache.set(cacheKey, data);
  return data;
};
```

### 4. Error Handling

```javascript
const searchUniversities = async (params) => {
  try {
    const response = await fetch(`https://apiuniversity.gkorean.com/api/universities/search?${new URLSearchParams(params)}`);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};
```

## 📝 Real-world Examples

### JavaScript/Fetch API

```javascript
// Search for universities in Vietnam
const searchVietnameseUniversities = async () => {
  try {
    const response = await fetch('https://apiuniversity.gkorean.com/api/universities/search?country=Vietnam&limit=50&sortBy=name');
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log(`Found ${data.count} universities in Vietnam`);
      data.data.forEach(uni => {
        console.log(`- ${uni.institution.name} (${uni.general_information.address.city})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### jQuery

```javascript
// Autocomplete with jQuery
$('#university-search').on('input', function() {
  const query = $(this).val();
  
  if (query.length >= 2) {
    $.get('https://apiuniversity.gkorean.com/api/universities/suggest', {
      q: query,
      limit: 10
    })
    .done(function(data) {
      if (data.status === 'success') {
        // Display suggestions
        displaySuggestions(data.data);
      }
    })
    .fail(function() {
      console.log('Suggestion request failed');
    });
  }
});
```

### Python requests

```python
import requests

def search_universities(country=None, search_term=None, limit=20):
    """Search universities using Python requests"""
    
    base_url = "https://apiuniversity.gkorean.com/api/universities/search"
    params = {}
    
    if country:
        params['country'] = country
    if search_term:
        params['search'] = search_term
    if limit:
        params['limit'] = limit
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data['status'] == 'success':
            return data['data']
        else:
            print(f"API Error: {data['message']}")
            return []
            
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return []

# Usage
universities = search_universities(country="Vietnam", limit=10)
for uni in universities:
    print(f"{uni['institution']['name']} - {uni['general_information']['address']['city']}")
```

### PHP cURL

```php
<?php
function searchUniversities($country = null, $searchTerm = null, $limit = 20) {
    $baseUrl = 'https://apiuniversity.gkorean.com/api/universities/search';
    $params = [];
    
    if ($country) $params['country'] = $country;
    if ($searchTerm) $params['search'] = $searchTerm;
    if ($limit) $params['limit'] = $limit;
    
    $url = $baseUrl . '?' . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: PHP-University-Search/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return $data['status'] === 'success' ? $data['data'] : [];
    }
    
    return [];
}

// Usage
$universities = searchUniversities('Vietnam', null, 10);
foreach ($universities as $uni) {
    echo $uni['institution']['name'] . " - " . $uni['general_information']['address']['city'] . "\n";
}
?>
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
