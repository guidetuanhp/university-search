// src/routes/universities.js
const express = require('express');
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');
const { buildSearchQuery, buildSortOptions } = require('../utils/queryBuilder');
const { validateSearchParams, validatePagination } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { logger } = require('../utils/logger');

const router = express.Router();

// 1. Search universities
router.get('/universities/search', validateSearchParams, validatePagination, cacheMiddleware(300), async (req, res) => {
  try {
    const {
      search,
      country,
      city,
      name,
      type,
      status,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = buildSearchQuery({ search, country, city, name, type, status });
    const sort = buildSortOptions(sortBy, sortOrder);
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const collection = getCollection();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get results with projection
    const results = await collection
      .find(query, {
        projection: {
          '_id': 1,
          'institution.name': 1,
          'institution.short_name': 1,
          'institution.iau_id': 1,
          'institution.country_line': 1,
          'general_information.address.city': 1,
          'general_information.address.country': 1,
          'general_information.type': 1,
          'general_information.status': 1,
          'general_information.established': 1,
          'student_staff_numbers.total_students': 1,
          'institution.updated_on': 1
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Add search score for text searches
    if (search) {
      results.forEach(doc => {
        if (doc.score) {
          doc._searchScore = doc.score;
        }
      });
    }

    const response = {
      status: 'success',
      data: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      query: { search, country, city, name, type, status },
      count: results.length
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during search'
    });
  }
});

// 2. Get search suggestions
router.get('/universities/suggest', cacheMiddleware(300), async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        status: 'success',
        data: [],
        count: 0
      });
    }

    const collection = getCollection();
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    
    const suggestions = await collection
      .find({
        $or: [
          { 'institution.name': { $regex: q.trim(), $options: 'i' } },
          { 'institution.short_name': { $regex: q.trim(), $options: 'i' } }
        ]
      }, {
        projection: {
          '_id': 1,
          'institution.name': 1,
          'institution.short_name': 1,
          'institution.iau_id': 1,
          'institution.country_line': 1,
          'general_information.address.city': 1
        }
      })
      .limit(limitNum)
      .toArray();

    const response = {
      status: 'success',
      data: suggestions,
      count: suggestions.length
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Suggestions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// 3. Get university details by ID
router.get('/universities/:id', cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    const collection = getCollection();
    
    let query;
    // Try ObjectId first, then fall back to iau_id
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { 'institution.iau_id': id };
    }
    
    const university = await collection.findOne(query);
    
    if (!university) {
      return res.status(404).json({
        status: 'error',
        message: 'University not found'
      });
    }

    // Keep the _id for reference but don't expose it directly
    const universityData = { ...university };
    universityData.id = university._id.toString();
    delete universityData._id;
    
    const response = {
      status: 'success',
      data: universityData
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Get university details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// 4. Get list of countries
router.get('/countries', cacheMiddleware(3600), async (req, res) => {
  try {
    const collection = getCollection();
    
    const countries = await collection.distinct('institution.country_line');
    const sortedCountries = countries
      .filter(c => c && c.trim())
      .sort();

    const response = {
      status: 'success',
      data: sortedCountries,
      count: sortedCountries.length
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Get countries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// 5. Get list of cities
router.get('/cities', cacheMiddleware(3600), async (req, res) => {
  try {
    const { country } = req.query;
    const collection = getCollection();
    
    const query = country 
      ? { 'institution.country_line': { $regex: country, $options: 'i' } }
      : {};
    
    const cities = await collection.distinct('general_information.address.city', query);
    const sortedCities = cities
      .filter(c => c && c.trim())
      .sort();

    const response = {
      status: 'success',
      data: sortedCities,
      count: sortedCities.length,
      country: country || 'all'
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Get cities error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// 6. Get all countries with university counts
router.get('/stats/countries/all', cacheMiddleware(1800), async (req, res) => {
  try {
    const collection = getCollection();
    
    const countriesStats = await collection.aggregate([
      { $group: { 
        _id: '$institution.country_line', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } }
    ]).toArray();

    const response = {
      status: 'success',
      data: countriesStats.filter(country => country._id && country._id.trim()),
      count: countriesStats.length
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Get all countries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// 7. Get statistics
router.get('/stats', cacheMiddleware(600), async (req, res) => {
  try {
    const collection = getCollection();
    
    const [
      totalUniversities,
      countryStats,
      typeStats,
      recentlyUpdated
    ] = await Promise.all([
      // Total universities
      collection.countDocuments(),
      
      // Statistics by country
      collection.aggregate([
        { $group: { 
          _id: '$institution.country_line', 
          count: { $sum: 1 } 
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Statistics by type
      collection.aggregate([
        { $group: { 
          _id: '$general_information.type', 
          count: { $sum: 1 } 
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // Recently updated universities
      collection.find(
        { 'institution.updated_on': { $exists: true } },
        { 
          projection: {
            '_id': 1,
            'institution.name': 1,
            'institution.country_line': 1,
            'institution.updated_on': 1
          }
        }
      )
      .sort({ 'institution.updated_on': -1 })
      .limit(5)
      .toArray()
    ]);

    const response = {
      status: 'success',
      data: {
        totalUniversities,
        topCountries: countryStats,
        institutionTypes: typeStats,
        recentlyUpdated
      }
    };

    // Cache the response
    req.cacheKey && (req.cache = response);
    
    res.json(response);

  } catch (error) {
    logger.error('Get statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
