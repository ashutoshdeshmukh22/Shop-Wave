const express = require('express');

const ReportController = require('../controllers/reports');

const router = express.Router();

router.get('/reports', ReportController.getReports);
router.get('/getAllProductsReport', ReportController.getTotalProducts);
router.get('/getInventory', ReportController.getInventory);
router.get('/getRevenue', ReportController.getRevenue);

module.exports = router;
