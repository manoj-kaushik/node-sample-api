const errors = require('../utils/errors');
const validate = require('../utils/validate');
const {
	getWellGuideDetailService,
	updateWellGuideDetailService,
	enableReminderService,
	getAllWellGuideDetailsService,
	calculateNextReminderService,
} = require('../services/wellGuide.service');
const {
	wellGuideQuerySchema,
	updateWellGuideBodySchema,
	updateWellGuideBodySchemaV100,
	wellGuideReminderBodySchema,
} = require('../models/wellGuide.model');

/**
 * Retrieves all well guide details.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while retrieving the well guide details.
 */
exports.getWellGuideList = async (req, res, next) => {
	try {
		const allDetails = await getAllWellGuideDetailsService();
		res.status(200).send({ data: allDetails });
	} catch (err) {
		next(err);
	}
};

/**
 * Retrieves the well guide details for a specific patient.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while retrieving the well guide details or the patient ID is missing.
 */
exports.getWellGuideById = async (req, res, next) => {
	try {
		const patientId = parseInt(req.params.patientId);
		validate(req.query, wellGuideQuerySchema);

		if (!patientId) {
			throw errors.INVALID_INPUT('Please complete the onboarding process.');
		}

		const wellGuideDetail = await getWellGuideDetailService(patientId);
		res.status(200).send({ data: wellGuideDetail });
	} catch (err) {
		next(err);
	}
};

/**
 * Updates the well guide details for a specific patient.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the well guide details or the patient ID is missing.
 */
exports.updateWellGuideDetail = async (req, res, next) => {
	try {
		const patientId = parseInt(req.params.patientId);
		validate(req.query, wellGuideQuerySchema);
		validate(req.body, updateWellGuideBodySchema);

		if (!patientId) {
			throw errors.INVALID_INPUT('Please complete the onboarding process.');
		}

		const wellGuideDetail = await updateWellGuideDetailService(patientId, req.body);
		res.status(200).send({ data: wellGuideDetail });
	} catch (err) {
		next(err);
	}
};

/**
 * Updates the well guide details for a specific patient.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while updating the well guide details or the patient ID is missing.
 */
exports.updateWellGuideDetailV100 = async (req, res, next) => {
	try {
		const patientId = parseInt(req.params.patientId);
		validate(req.query, wellGuideQuerySchema);
		validate(req.body, updateWellGuideBodySchemaV100);

		if (!patientId) {
			throw errors.INVALID_INPUT('Please complete the onboarding process.');
		}

		const wellGuideDetail = await updateWellGuideDetailService(patientId, req.body);
		res.status(200).send({ data: wellGuideDetail });
	} catch (err) {
		next(err);
	}
};

/**
 * Turns on the reminder for a specific patient and well guide.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs while turning on the reminder or the patient ID is missing.
 */
exports.enableReminder = async (req, res, next) => {
	try {
		const patientId = parseInt(req.params.patientId);
		validate(req.query, wellGuideQuerySchema);
		validate(req.body, wellGuideReminderBodySchema);

		if (!patientId) {
			throw errors.INVALID_INPUT('Please complete your profile first.');
		}

		const reminder = await enableReminderService(patientId, req.body);

		// Calculate the next reminder date and format it as month and year
		const nextReminder = await calculateNextReminderService(
			reminder[0].last_appointment_date,
			reminder[0].well_guide_id
		);
		const nextReminderMonth = new Date(nextReminder).toLocaleString('default', {
			month: 'long',
		});
		const nextReminderYear = new Date(nextReminder).getUTCFullYear();

		res.status(200).send({
			data: reminder,
			nextReminderMonth,
			nextReminderYear,
		});
	} catch (err) {
		next(err);
	}
};
