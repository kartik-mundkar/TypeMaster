# TypeMaster Backend API

A Node.js/Express backend server for the TypeMaster typing application that provides secure text content from various sources.

## Features

- 🔒 **Secure API key management** - API keys stored on server, not exposed to frontend
- ⚡ **Intelligent caching** - Reduces external API calls and improves performance
- 🛡️ **Rate limiting** - Prevents abuse and controls API usage
- 🎯 **Multiple text sources** - Local content, quotes, lorem ipsum, and news articles
- 🔄 **Automatic fallbacks** - Always returns content even if external APIs fail
- 📊 **Health monitoring** - Built-in health check endpoint

## API Endpoints

### Text Endpoints

#### `GET /api/text/random`
Get random text for typing practice.

**Query Parameters:**
- `source` - Text source: `local`, `quotes`, `lorem`, `news` (default: `local`)
- `mode` - Test mode: `time`, `words`, `quote` (default: `time`)
- `wordCount` - Number of words for word mode (default: `50`)
- `difficulty` - Text difficulty: `easy`, `medium`, `hard` (default: `medium`)

**Example:**
```
GET /api/text/random?source=quotes&mode=words&wordCount=30
```

#### `GET /api/text/quotes`
Get quote-based text.

**Query Parameters:**
- `category` - Quote category (optional)
- `minLength` - Minimum character length (default: `100`)
- `maxLength` - Maximum character length (default: `300`)

#### `GET /api/text/lorem`
Get lorem ipsum text.

**Query Parameters:**
- `paragraphs` - Number of paragraphs (default: `4`)

#### `GET /api/text/news`
Get news-based text.

**Query Parameters:**
- `topic` - News topic (default: `technology`)

#### `GET /api/text/sources`
Get available text sources information.

### System Endpoints

#### `GET /health`
Health check endpoint.

## Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Configuration
Copy `.env` file and update with your API keys:

```bash
# API Keys
NEWS_API_KEY=your_actual_news_api_key_from_newsapi.org

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Get API Keys (Optional)

**News API (Optional):**
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for free account
3. Get your API key
4. Add it to `.env` file

*Note: The server works without API keys using fallback content.*

### 4. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Get random local text
curl http://localhost:5000/api/text/random

# Get quotes
curl http://localhost:5000/api/text/quotes

# Get lorem ipsum
curl http://localhost:5000/api/text/lorem

# Get available sources
curl http://localhost:5000/api/text/sources
```

## Security Features

- **Helmet.js** - Sets security headers
- **Rate limiting** - 100 requests per 15 minutes per IP
- **CORS protection** - Only allows requests from configured frontend
- **Input validation** - Validates and sanitizes query parameters
- **Error handling** - Secure error responses without sensitive information

## Caching

- **TTL**: 5 minutes for API responses
- **Benefits**: Reduces external API calls, improves response time
- **Auto-cleanup**: Expired cache entries are automatically removed

## Architecture Benefits

✅ **Security**: API keys hidden from frontend  
✅ **Performance**: Caching and optimized responses  
✅ **Reliability**: Automatic fallbacks when APIs fail  
✅ **Scalability**: Rate limiting and efficient resource usage  
✅ **Maintainability**: Clean separation of concerns  
✅ **Cost Control**: Reduced external API calls through caching

## Frontend Integration

The frontend should call this backend instead of external APIs:

```javascript
// Instead of calling external APIs directly
const response = await fetch('http://localhost:5000/api/text/random?source=quotes');
const data = await response.json();
const text = data.data.text;
```
