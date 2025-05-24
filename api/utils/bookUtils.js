/**
 * Calculate average rating from reviews
 * @param {Array} reviews - Array of review objects with rating property
 * @returns {Object} Object with average rating and count
 */
const averageRating = (reviews) => {
  if (!reviews || !reviews.length) {
    return { avgRating: 0, count: 0 };
  }
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avg = total / reviews.length;
  
  return {
    avgRating: parseFloat(avg.toFixed(1)),
    count: reviews.length
  };
};

module.exports = {
  averageRating
};