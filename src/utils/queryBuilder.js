// src/utils/queryBuilder.js

function buildSearchQuery(params) {
  const query = {};
  
  // Full text search
  if (params.search) {
    query.$text = { $search: params.search };
  }
  
  // Filter by country
  if (params.country) {
    query['institution.country_line'] = { 
      $regex: params.country, 
      $options: 'i' 
    };
  }
  
  // Filter by city
  if (params.city) {
    query['general_information.address.city'] = { 
      $regex: params.city, 
      $options: 'i' 
    };
  }
  
  // Filter by university name (if not using text search)
  if (params.name && !params.search) {
    query.$or = [
      { 'institution.name': { $regex: params.name, $options: 'i' } },
      { 'institution.short_name': { $regex: params.name, $options: 'i' } }
    ];
  }
  
  // Filter by type
  if (params.type) {
    query['general_information.type'] = { 
      $regex: params.type, 
      $options: 'i' 
    };
  }
  
  // Filter by status
  if (params.status) {
    query['general_information.status'] = { 
      $regex: params.status, 
      $options: 'i' 
    };
  }
  
  return query;
}

function buildSortOptions(sortBy, sortOrder = 'asc') {
  const sort = {};
  const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
  
  switch (sortBy) {
    case 'name':
      sort['institution.name'] = order;
      break;
    case 'country':
      sort['institution.country_line'] = order;
      break;
    case 'city':
      sort['general_information.address.city'] = order;
      break;
    case 'type':
      sort['general_information.type'] = order;
      break;
    case 'updated':
      sort['institution.updated_on'] = order;
      break;
    case 'established':
      sort['general_information.established'] = order;
      break;
    default:
      sort['institution.name'] = 1; // Default sort by name
  }
  
  return sort;
}

module.exports = {
  buildSearchQuery,
  buildSortOptions
};
