const mongoose = require("mongoose");

const searchAnalyticsSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: [true, "Search keyword is required"],
      trim: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    responseTime: {
      type: Number,
      required: [true, "Response time in milliseconds is required"]
    },
    resultCount: {
      type: Number,
      required: [true, "Result count is required"]
    }
  }
);

// Compound index for querying statistics by keyword and time range
searchAnalyticsSchema.index({ keyword: 1, timestamp: -1 });

const SearchAnalytics = mongoose.model("SearchAnalytics", searchAnalyticsSchema);

module.exports = SearchAnalytics;
