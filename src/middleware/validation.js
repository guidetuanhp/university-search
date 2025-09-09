// src/middleware/validation.js

function validateSearchParams(req, res, next) {
  const { search, name, country, city, type, status } = req.query;
  
  // Validate search query length
  if (search && search.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query too long (max 100 characters)'
    });
  }
  
  // Validate name length
  if (name && name.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Name query too long (max 100 characters)'
    });
  }
  
  // Validate country length
  if (country && country.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Country query too long (max 50 characters)'
    });
  }
  
  // Validate city length
  if (city && city.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'City query too long (max 50 characters)'
    });
  }
  
  next();
}

function validatePagination(req, res, next) {
  const { page, limit, sortBy, sortOrder } = req.query;
  
  // Validate page number
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid page number'
    });
  }
  
  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid limit (must be between 1 and 100)'
    });
  }
  
  // Validate sort field
  const validSortFields = ['name', 'country', 'city', 'type', 'updated', 'established'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid sort field. Valid options: ${validSortFields.join(', ')}`
    });
  }
  
  // Validate sort order
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid sort order (must be asc or desc)'
    });
  }
  
  next();
}

module.exports = {
  validateSearchParams,
  validatePagination
};
