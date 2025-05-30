const express = require("express");
const router = express.Router();
const Concern_List = require("../models/Concern_list");
const path = require("path");
const multer = require("multer");

// Configure storage for proof uploads
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public', 'proofs'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProof = multer({ 
  storage: proofStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all concerns with categories
router.get("/concerns-with-categories", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/");
    }

    const concernsWithCategories = await Concern_List.aggregate([
      {
        $lookup: {
          from: "concern_categories",
          localField: "category",
          foreignField: "category_name",
          as: "category_details",
        },
      },
      {
        $unwind: {
          path: "$category_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          debug: {
            hasCategoryDetails: { $ifNull: ["$category_details", false] },
            originalCategory: "$category",
          },
        },
      },
    ]);

    console.log("Aggregation result sample:", concernsWithCategories.slice(0, 1));

    res.render("concern_list", {
      user: req.session.user,
      concerns: concernsWithCategories,
    });
  } catch (error) {
    console.error("Error in concerns-with-categories:", error);
    res.status(500).send("Server error");
  }
});

// Update concern status
router.post('/update-concern-status/:id', async (req, res) => {
  try {
    const { newStatus } = req.body;
    const concern = await Concern_List.findByIdAndUpdate(
      req.params.id,
      { concern_status: newStatus },
      { new: true }
    );
    
    if (!concern) {
      return res.status(404).json({ success: false, message: 'Concern not found' });
    }
    
    res.json({ success: true, concern });
  } catch (error) {
    console.error('Error updating concern status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload proof
router.post('/upload-proof/:id', uploadProof.single('proof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const proofUrl = `/proofs/${req.file.filename}`;
    
    await Concern_List.findByIdAndUpdate(
      req.params.id,
      { proof_url: proofUrl },
      { new: true }
    );

    res.json({ 
      success: true,
      proofUrl: proofUrl
    });
  } catch (error) {
    console.error('Error uploading proof:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;