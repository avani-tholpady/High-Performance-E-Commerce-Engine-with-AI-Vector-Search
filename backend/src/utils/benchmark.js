/**
 * High-resolution performance benchmarking utility.
 */
const startBenchmark = () => {
  return process.hrtime();
};

/**
 * Calculates milliseconds elapsed since startTime.
 * @param {Array} startTime Hrtime array
 * @returns {number} Time in milliseconds
 */
const getDurationMs = (startTime) => {
  const diff = process.hrtime(startTime);
  return parseFloat(((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2));
};

module.exports = {
  startBenchmark,
  getDurationMs
};
