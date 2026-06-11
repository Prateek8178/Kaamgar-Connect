const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getWorkers, getWorkerDetail } = require('../controllers/workerController');

router.get('/', getWorkers);
router.get('/:id', getWorkerDetail);

module.exports = router;
