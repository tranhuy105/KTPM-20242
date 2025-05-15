/**
 * Utility functions for pagination
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} - Parsed pagination parameters
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  // Validate to prevent negative values
  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(limit, 100)), // Min: 1, Max: 100
    skip: Math.max(0, skip),
  };
};

/**
 * Build pagination result object
 * @param {number} totalCount - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} baseUrl - Base URL for building links (optional)
 * @returns {Object} - Pagination result
 */
const buildPaginationResult = (totalCount, page, limit, baseUrl = null) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const result = {
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage,
    hasPrevPage,
  };

  // Add HATEOAS links if baseUrl is provided
  if (baseUrl) {
    result.links = {};

    if (hasPrevPage) {
      result.links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }

    if (hasNextPage) {
      result.links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }

    result.links.first = `${baseUrl}?page=1&limit=${limit}`;
    result.links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
  }

  return result;
};

module.exports = {
  getPaginationParams,
  buildPaginationResult,
};
