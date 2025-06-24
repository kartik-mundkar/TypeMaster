const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Fallback texts - expanded collection
const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog and runs through the forest with great speed and agility while avoiding all obstacles.",
  "Programming is not just about writing code it is about solving problems and creating solutions that make people's lives better and more efficient.",
  "In the world of technology everything changes rapidly and developers must constantly learn new skills and adapt to new frameworks and methodologies.",
  "Good design is not just about making things look beautiful it is about making them work well and providing an excellent user experience.",
  "The art of typing fast and accurately requires practice patience and proper finger positioning on the keyboard with consistent daily training.",
  "Artificial intelligence and machine learning are transforming industries by automating complex tasks and providing intelligent insights from vast amounts of data.",
  "Web development has evolved significantly with the introduction of modern frameworks like React Vue and Angular making development more efficient and maintainable.",
  "Database design and optimization are crucial skills for backend developers who need to ensure applications can scale and perform well under heavy loads.",
  "User experience design focuses on creating intuitive and accessible interfaces that provide value to users while achieving business objectives effectively.",
  "Software testing and quality assurance help maintain code reliability and prevent bugs from reaching production environments where they could impact users.",
  "Cloud computing platforms enable developers to build scalable applications without worrying about infrastructure management and hardware limitations.",
  "Mobile app development requires understanding different platforms and creating responsive designs that work seamlessly across various device sizes and capabilities.",
  "Cybersecurity has become increasingly important as more businesses rely on digital systems and need to protect sensitive data from various threats.",
  "DevOps practices combine development and operations to streamline the software delivery process and improve collaboration between different teams.",
  "Open source software has revolutionized the tech industry by allowing developers to collaborate and build upon each other's work freely."
];

class TextService {  async getRandomText({ source, mode, wordCount, difficulty }) {
    // For mixed source and quotes, don't use cache to ensure variety
    const shouldCache = source === 'lorem' || source === 'news';
    const cacheKey = `text_${source}_${mode}_${wordCount}_${difficulty}`;
    
    // Check cache first only for sources that should be cached
    if (shouldCache) {
      const cachedText = cache.get(cacheKey);
      if (cachedText) {
        console.log('Returning cached text for:', cacheKey);
        return cachedText;
      }
    }

    let text = '';

    try {      switch (source) {
        case 'mixed': {
          // Randomly choose from all available sources
          const sources = ['local', 'quotes', 'lorem'];
          const randomSource = sources[Math.floor(Math.random() * sources.length)];
          
          if (randomSource === 'local') {
            text = this.getLocalText();
          } else if (randomSource === 'quotes') {
            text = await this.getQuotes({ minLength: 100, maxLength: 300 });
          } else if (randomSource === 'lorem') {
            text = await this.getLoremText({ paragraphs: 4 });
          }
          break;
        }
        case 'quotes':
          text = await this.getQuotes({ minLength: 100, maxLength: 300 });
          break;
        case 'lorem':
          text = await this.getLoremText({ paragraphs: 4 });
          break;
        case 'news':
          text = await this.getNewsText({ topic: 'technology' });
          break;
        case 'local':
        default:
          text = this.getLocalText();
          break;      }

      // Always adjust text to match requested word count (regardless of mode)
      if (wordCount && wordCount > 0) {
        const words = text.split(' ').filter(word => word.trim().length > 0);
        
        if (words.length > wordCount) {
          // If we have more words than needed, truncate
          text = words.slice(0, wordCount).join(' ');
        } else if (words.length < wordCount) {
          // If we have fewer words than needed, repeat the text
          const repeatedWords = [];
          let currentIndex = 0;
          
          while (repeatedWords.length < wordCount) {
            repeatedWords.push(words[currentIndex % words.length]);
            currentIndex++;
          }
          
          text = repeatedWords.join(' ');
        }
      }

      // Cache the result only for sources that should be cached
      if (shouldCache) {
        cache.set(cacheKey, text);
      }
      
      return text;
    } catch (error) {
      console.error('Error fetching text:', error);
      // Return fallback text
      return this.getLocalText();
    }
  }

  getLocalText() {
    return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
  }  async getQuotes({ category, minLength = 100, maxLength = 300 }) {
    try {
      // Try the quotable.io API endpoint with shorter timeout for faster fallback
      const url = `https://api.quotable.io/quotes/random?minLength=${minLength}&maxLength=${maxLength}`;
      const response = await axios.get(url, { 
        timeout: 3000, // Reduced timeout for faster fallback
        headers: {
          'User-Agent': 'TypeMaster-App/1.0'
        }
      });
      
      if (response.data && response.data.length > 0 && response.data[0].content) {
        console.log('Successfully fetched quote from external API');
        return response.data[0].content;
      }
      
      throw new Error('Invalid response format from quotes API');
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Quotes API unavailable, using local fallback:', error.code || error.message);
      }
      
      // Fallback to a curated list of technology and programming quotes
      const programmingQuotes = [
        "Programs must be written for people to read, and only incidentally for machines to execute.",
        "The best way to get a project done faster is to start sooner.",
        "Code is like humor. When you have to explain it, it's bad.",
        "First, solve the problem. Then, write the code.",
        "Experience is the name everyone gives to their mistakes.",
        "In order to understand recursion, one must first understand recursion.",
        "Programming isn't about what you know; it's about what you can figure out.",
        "The most important property of a program is whether it accomplishes the intention of its user.",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        "Talk is cheap. Show me the code."
      ];
      
      return programmingQuotes[Math.floor(Math.random() * programmingQuotes.length)];
    }
  }
  async getLoremText({ paragraphs = 4 }) {
    try {
      // Try a different lorem API that's more reliable
      const url = `https://jsonplaceholder.typicode.com/posts/1`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data && response.data.body) {
        // Clean up the text and repeat it to get more content
        let text = response.data.body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        
        // If it's too short, repeat it with variation
        while (text.length < 200) {
          text += ' ' + response.data.title + ' ' + response.data.body.replace(/\n/g, ' ');
        }
        
        return text.substring(0, 400).replace(/\s+/g, ' ').trim();
      }
      
      throw new Error('No data received from API');    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Lorem API unavailable, using local fallback:', error.code || error.message);
      }
      
      // Fallback to manually generated lorem-style text
      const loremTexts = [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident similique sunt in culpa qui officia deserunt mollitia animi id est laborum et dolorum fuga."
      ];
      
      return loremTexts[Math.floor(Math.random() * loremTexts.length)];
    }
  }

  async getNewsText({ topic = 'technology' }) {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      
      if (!apiKey || apiKey === 'your_news_api_key_here') {
        console.warn('News API key not configured, using fallback text');
        return this.getLocalText();
      }

      const url = `https://newsapi.org/v2/everything?q=${topic}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data && response.data.articles && response.data.articles.length > 0) {
        // Get a random article from the results
        const randomArticle = response.data.articles[Math.floor(Math.random() * response.data.articles.length)];
        
        // Use description or content, clean it up
        let text = randomArticle.description || randomArticle.content || '';
        
        // Clean up the text
        text = text
          .replace(/\[.*?\]/g, '') // Remove [+X chars] or similar
          .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (text.length > 50) {
          return text;
        }
      }
      
      throw new Error('No suitable article found');    } catch (error) {
      // Only log news API errors in development (since it requires API key anyway)
      if (process.env.NODE_ENV === 'development') {
        console.warn('News API unavailable, using local fallback:', error.code || error.message);
      }
      return this.getLocalText();
    }
  }

  // Method to get text by specific difficulty
  getTextByDifficulty(difficulty = 'medium') {
    const difficultyTexts = {
      easy: [
        "The cat sat on the mat and looked around the room with curious eyes.",
        "Today is a good day to learn something new and practice typing skills.",
        "Simple words make typing practice easy and fun for everyone to enjoy."
      ],
      medium: [
        "Programming requires logical thinking and attention to detail when writing code.",
        "Modern web development involves multiple technologies working together seamlessly.",
        "Effective communication skills are essential in professional environments today."
      ],
      hard: [
        "Sophisticated algorithms optimize computational efficiency through parallelization and vectorization techniques.",
        "Quantum computing paradigms necessitate fundamental reconceptualization of traditional computational methodologies.",
        "Cryptographic implementations require meticulous attention to mathematical precision and security considerations."
      ]
    };

    const texts = difficultyTexts[difficulty] || difficultyTexts.medium;
    return texts[Math.floor(Math.random() * texts.length)];
  }

  // Clear cache method
  clearCache() {
    cache.flushAll();
    console.log('Text cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      keys: cache.keys().length,
      stats: cache.getStats()
    };
  }
}

module.exports = new TextService();
