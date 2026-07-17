'use strict';

/**
 * Normalise page/limit query values into Prisma skip/take plus echo metadata.
 * @param {{ page?: number, limit?: number }} query
 */
function getPagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/**
 * Build a paginated response envelope.
 */
function paginated(items, total, { page, limit }) {
  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { getPagination, paginated };
