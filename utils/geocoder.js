// utils/geocoder.js
const axios = require('axios');

async function reverseGeocode(lat, lng) {
  try {
    // Using Nominatim (OpenStreetMap)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (response.data.address) {
      const addr = response.data.address;
      // Customize this format based on what you need
      return `${addr.road || ''} ${addr.hamlet || addr.village || addr.town || addr.city}, ${addr.state || ''}, ${addr.country || ''}`.trim();
    }
    return "Address not found";
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Error getting address";
  }
}

module.exports = { reverseGeocode };