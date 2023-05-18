const knex = require('../utils/knex');
const {
	wellGuideId,
	wellGuideStatus,
	wellGuideRoutineDuration,
} = require('../constants/appConstants');
const moment = require('moment');
const _ = require('lodash');

/**
 * Retrieves the well guide details for a specific patient.
 * @param {number} patientId - The ID of the patient.
 * @returns {Promise<Object[]>} The well guide details for the specified patient.
 */
exports.getWellGuideDetailService = async (patientId) => {
	try {
		return await knex
			.select([
				'uwg.last_appointment_date AS lastAppointmentDate',
				'uwg.status AS wellGuideStatus',
				'wg.name AS wellGuideName',
				'wg.speciality AS wellGuideSpeciality',
				'wg.description AS wellGuideDescription',
				'wg.image_url AS wellGuideImageUrl',
				'uwg.patient_id AS patientId',
				'wg.id AS wellGuideId',
				'b.start_time AS startTime',
				'b.booking_time_zone AS bookingTimeZone',
			])
			.from('user_well_guide AS uwg')
			.leftJoin('well_guide AS wg', 'uwg.well_guide_id', 'wg.id')
			.leftJoin('booking AS b', 'b.id', 'uwg.booking_id')
			.where('uwg.patient_id', patientId);
	} catch (error) {
		throw error;
	}
};

/**
 * Retrieves all well guide details.
 * @returns {Promise} A Promise object representing the well guide details.
 */
exports.getAllWellGuideDetailsService = async () => {
	return await knex.select('*').from('well_guide');
};

/**
 * Turns on a reminder for a specific patient and well guide.
 * @param {number} patientId - The ID of the patient.
 * @param {object} wellGuideDetail - An object containing the details of the well guide.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the updated user_well_guide record.
 */
exports.enableReminderService = async (patientId, wellGuideDetail) => {
	const updatedRecord = await knex('user_well_guide')
		.update(wellGuideDetail)
		.where({
			patient_id: patientId,
			well_guide_id: wellGuideDetail.well_guide_id,
		})
		.returning('*');

	return updatedRecord;
};

/**
 * Calculates the date of the next reminder for a specific well guide based on the last reminder date and routine duration.
 * @param {string} lastReminder - A string representing the last reminder date in ISO 8601 format.
 * @param {number} id - The ID of the well guide.
 * @returns {moment.Moment} - A moment.js object representing the date of the next reminder.
 */
exports.calculateNextReminderService = async (lastReminder, id) => {
	const wellGuideName = _.findKey(wellGuideId, function (wellGuideValue) {
		return wellGuideValue == id;
	});
	const routineDuration = wellGuideRoutineDuration[wellGuideName];
	return moment(new Date(lastReminder)).add(routineDuration, 'months');
};

/**
 * Updates the details of a well guide for a specific patient.
 * @param {number} patientId - The ID of the patient.
 * @param {object} body - An object containing the updated details of the well guide.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the updated user_well_guide record.
 */
exports.updateWellGuideDetailService = async (patientId, body) => {
	let wellGuideDetail = { ...body };
	wellGuideDetail.patient_id = patientId;

	wellGuideDetail.last_appointment_date = moment(
		Number(wellGuideDetail.last_appointment_date)
	)
		.utcOffset(wellGuideDetail.off_set)
		.utc()
		.toISOString();

	wellGuideDetail = await _calculateWellGuideStatus(body);

	const nextReminder = moment().add(1, 'd');
	wellGuideDetail.next_reminder = nextReminder.format('MM/DD/YYYY');
	wellGuideDetail.due_in_one_month_reminder = false;
	wellGuideDetail.due_for_visit_reminder = false;

	const isFirstWellGuideExperience = await knex('user_well_guide').where({
		patient_id: patientId,
		well_guide_id: wellGuideDetail.well_guide_id,
	});

	if (isFirstWellGuideExperience.length !== 0) {
		return await knex('user_well_guide')
			.update(wellGuideDetail)
			.where({
				patient_id: patientId,
				well_guide_id: wellGuideDetail.well_guide_id,
			})
			.returning('*');
	} else {
		return await knex('user_well_guide').insert(wellGuideDetail).returning('*');
	}
};

/**
 * Updates the details of a well guide for a specific patient.
 * @param {number} patientId - The ID of the patient.
 * @param {object} body - An object containing the updated details of the well guide.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the updated user_well_guide record.
 */
exports.updateWellGuideDetailService = async (patientId, body) => {
	let wellGuideDetail = { ...body };
	wellGuideDetail.patient_id = patientId;

	wellGuideDetail.last_appointment_date = moment(
		Number(wellGuideDetail.last_appointment_date)
	)
		.utcOffset(wellGuideDetail.off_set)
		.utc()
		.toISOString();

	wellGuideDetail = await _calculateWellGuideStatus(body);

	const nextReminder = moment().add(1, 'd');
	wellGuideDetail.next_reminder = nextReminder.format('MM/DD/YYYY');
	wellGuideDetail.due_in_one_month_reminder = false;
	wellGuideDetail.due_for_visit_reminder = false;

	const isFirstWellGuideExperience = await knex('user_well_guide').where({
		patient_id: patientId,
		well_guide_id: wellGuideDetail.well_guide_id,
	});

	if (isFirstWellGuideExperience.length !== 0) {
		return await knex('user_well_guide')
			.update(wellGuideDetail)
			.where({
				patient_id: patientId,
				well_guide_id: wellGuideDetail.well_guide_id,
			})
			.returning('*');
	} else {
		return await knex('user_well_guide').insert(wellGuideDetail).returning('*');
	}
};

/**
 * Calculates the status of a well guide based on its last appointment date and routine duration.
 * @param {object} wellGuideDetail - An object containing the details of the well guide.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the updated user_well_guide record.
 */
function _calculateWellGuideStatus(wellGuideDetail) {
	let routineDuration;
	const wellGuideName = _.findKey(wellGuideId, function (wellGuideValue) {
		return wellGuideValue == wellGuideDetail.well_guide_id;
	});
	routineDuration = wellGuideRoutineDuration[wellGuideName];

	const monthsLeft = _calculateMonthsFromLastAppointment(
		wellGuideDetail.last_appointment_date
	);
	const nextReminder = moment();

	switch (true) {
		case monthsLeft < 0:
			wellGuideDetail.status = wellGuideStatus.scheduled;
			break;
		case (monthsLeft > routineDuration - 1 && monthsLeft < routineDuration) ||
			monthsLeft == routineDuration - 1: {
			wellGuideDetail.status = wellGuideStatus.dueInOneMonth;
			if (!wellGuideDetail.due_in_one_month_reminder) {
				wellGuideDetail.next_reminder = nextReminder.format('MM/DD/YYYY');
				wellGuideDetail.due_in_one_month_reminder = true;
			}
			break;
		}
		case monthsLeft > routineDuration: {
			wellGuideDetail.status = wellGuideStatus.dueForAVisit;
			if (!wellGuideDetail.due_for_visit_reminder) {
				wellGuideDetail.next_reminder = nextReminder.format('MM/DD/YYYY');
				wellGuideDetail.due_for_visit_reminder = true;
			}
			break;
		}
		case monthsLeft == 0: {
			wellGuideDetail.status = wellGuideStatus.dueForAVisit;
			if (!wellGuideDetail.due_for_visit_reminder) {
				wellGuideDetail.next_reminder = nextReminder.format('MM/DD/YYYY');
				wellGuideDetail.due_for_visit_reminder = true;
			}
			break;
		}
		case monthsLeft < routineDuration - 1:
			wellGuideDetail.status = wellGuideStatus.uptodate;
			break;
		default:
			wellGuideDetail.status = wellGuideStatus.dueForAVisit;
	}

	return wellGuideDetail;
}

/**
 * Calculates the number of months between the current date and a given date.
 * @param {string} lastAppointment - A string representing the last appointment date in ISO 8601 format.
 * @returns {number} - The number of months between the current date and the last appointment date.
 */
function _calculateMonthsFromLastAppointment(lastAppointment) {
	const today = moment();
	const duration = moment.duration(today.diff(lastAppointment));
	const months = duration.asMonths();
	return months;
}

/**
 * Updates the reminder status for a specific well guide for a patient.
 * @param {number} patientId - The ID of the patient.
 * @param {number} wellGuideId - The ID of the well guide.
 * @param {string} status - The status of the reminder.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the updated user_well_guide record.
 */
exports.updateReminderStatusService = async (
	patientId,
	wellGuideId,
	status
) => {
	let nextDate;

	if (status === wellGuideStatus.dueInOneMonth) {
		nextDate = moment().add(7, 'd');
	} else if (status === wellGuideStatus.dueForAVisit) {
		nextDate = moment().add(14, 'd');
	}

	return await knex('user_well_guide')
		.update({ next_reminder: nextDate })
		.where({ patient_id: patientId, well_guide_id: wellGuideId });
};

/**
 * Retrieves the email, first name, last name, and phone number of a specific user.
 * @param {number} patientId - The ID of the user.
 * @returns {Promise<object>} - A Promise that resolves to an object representing the user's information.
 */
exports.getEmailInfoService = async (patientId) => {
	return await knex
		.select('first_name', 'last_name', 'email', 'phone')
		.from('users')
		.where('id', patientId);
};

/**
 * Checks if a user with a specific email address already exists.
 * @param {object} user - An object containing the email address of the user.
 * @returns {Promise<object[]>} - A Promise that resolves to an array of user records that match the email address.
 */
exports.checkUserService = async (user) => {
	return await knex('users').where('email', user.email);
};
