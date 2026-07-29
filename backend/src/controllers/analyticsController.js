const SearchAnalytics = require("../models/SearchAnalytics");
const { successResponse } = require("../utils/apiResponse");

// GET /api/analytics/search
const getSearchAnalytics = async (req, res, next) => {
  try {
    const stats = await SearchAnalytics.aggregate([
      {
        $group: {
          _id: { $toLower: "$keyword" },
          keyword: { $first: "$keyword" },
          searchCount: { $sum: 1 },
          avgResponseTimeMs: { $avg: "$responseTime" },
          avgResultCount: { $avg: "$resultCount" },
          lastSearchedAt: { $max: "$timestamp" }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: 50 }
    ]);

    // Clean averages to 2 decimal places
    const formattedStats = stats.map(item => ({
      ...item,
      avgResponseTimeMs: parseFloat(item.avgResponseTimeMs.toFixed(2)),
      avgResultCount: parseFloat(item.avgResultCount.toFixed(2))
    }));

    return successResponse(res, 200, "Search analytics statistics retrieved successfully", formattedStats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSearchAnalytics
};
