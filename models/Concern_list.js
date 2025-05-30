const mongoose = require("mongoose");

// Define the Concern List Schema
const Concern_ListSchema = new mongoose.Schema({
  _id: String,
  email: String,
  category: String, // This will link to the category_name in the concern_categories collection
  concern_text: String,
  image_path: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  created_at: Date,
  device_id: String,
  sync_status: String,
  synced_at: Date,
  concern_status: String, 
  proof_url: {
    type: String,
    default: null
  },
    
},{collection: 'concern_list'});

// Create the Concern model
const Concern_List = mongoose.model("Concern_list", Concern_ListSchema);



module.exports = Concern_List;
