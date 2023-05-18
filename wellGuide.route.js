const route = require('./utils/route');

const {
	getWellGuideById,
	updateWellGuideDetailV100,
	updateWellGuideDetail,
	enableReminder,
	getWellGuideList,
} = require('../controllers/wellGuide.controller');

route.get('/well-guide', getWellGuideList);
route.get('/well-guide/:patientId', getWellGuideById);
route.put('/well-guide/:patientId', {
	'1.0.0': updateWellGuideDetailV100,
	'1.1.0': updateWellGuideDetail,
});
route.put('/well-guide/:patientId/remindMe', enableReminder);
