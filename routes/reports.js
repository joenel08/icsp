const express = require("express");
const router = express.Router();
const Concern_List = require("../models/Concern_list");
const SurveyResponse = require("../models/SurveyReport");
const ConcernCategories = require('../models/Concern_categories');

// Report page
router.get('/report', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('report', { user: req.session.user });
});

// Get concerns report data
router.get('/api/concerns-report', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    let matchStage = {};
    
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    if (period === 'today') {
      matchStage.created_at = { $gte: startOfDay };
    } else if (period === 'week') {
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      matchStage.created_at = { $gte: startOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage.created_at = { $gte: startOfMonth };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchStage.created_at = { $gte: startOfYear };
    }

    let aggregationPipeline = [];

    if (period === 'today') {
      aggregationPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: "$concern_status",
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            statuses: {
              $push: {
                status: "$_id",
                count: "$count"
              }
            }
          }
        }
      ];
    } else if (period === 'week') {
      aggregationPipeline = [
        { $match: matchStage },
        {
          $addFields: {
            dayOfWeek: { $dayOfWeek: "$created_at" }
          }
        },
        {
          $group: {
            _id: {
              dayOfWeek: "$dayOfWeek",
              status: "$concern_status"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.dayOfWeek",
            statuses: {
              $push: {
                status: "$_id.status",
                count: "$count"
              }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ];
    } else {
      aggregationPipeline = [
        { $match: matchStage },
        {
          $project: {
            concern_status: 1,
            created_at: 1,
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" }
          }
        },
        {
          $group: {
            _id: {
              timeUnit: period === 'year' ? "$month" : "$day",
              status: "$concern_status"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.timeUnit",
            statuses: {
              $push: {
                status: "$_id.status",
                count: "$count"
              }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ];
    }

    const reportData = await Concern_List.aggregate(aggregationPipeline);
    console.log(reportData)
    res.json(reportData);
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


//survey
router.get('/survey_report', async (req, res) => {
  try {
    const surveyData = await SurveyResponse.aggregate([
      {
        $lookup: {
          from: 'concern_list', // FIXED
          localField: 'concern_id',
          foreignField: '_id',
          as: 'concern'
        }
      },
      { $unwind: '$concern' },
      {
        $lookup: {
          from: 'concern_categories', // FIXED
          localField: 'concern.category',
          foreignField: 'category_name',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' }
    ]);

    // const questionStats = [
    //   { total: 0, count: 0, responses: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } },
    //   { total: 0, count: 0, responses: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } },
    //   { total: 0, count: 0, responses: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } },
    //   { total: 0, count: 0, responses: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } },
    //   { total: 0, count: 0, responses: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } },
    // ];

    // surveyData.forEach(data => {
    //   data.responses.forEach((res, index) => {
    //     const val = parseInt(res);
    //     if (!isNaN(val) && questionStats[index]) {
    //       questionStats[index].responses[val]++;
    //       questionStats[index].total += val;
    //       questionStats[index].count++;
    //     }
    //   });
    // });

    const questionStats = [
      { count: 0, responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      { count: 0, responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      { count: 0, responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      { count: 0, responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      { count: 0, responses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    ];
    
    surveyData.forEach(data => {
      data.responses.forEach((res, index) => {
        const val = parseInt(res);
        if (!isNaN(val) && val >= 1 && val <= 5 && questionStats[index]) {
          questionStats[index].responses[val]++;
          questionStats[index].count++;
        }
      });
    });
    
    
    // Calculate averages
    questionStats.forEach(stat => {
      stat.avg = stat.count ? (stat.total / stat.count).toFixed(2) : 0;
    });
    
    // console.log("surveyData:", surveyData); // ✅ DEBUG OUTPUT

    res.render('survey_report', { user: req.session.user, surveyData,  questionStats });
  } catch (error) {
    console.error('Survey report aggregation error:', error);
    res.status(500).send('Error generating report');
  }
});


module.exports = router;