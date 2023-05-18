const wellGuideQuerySchema = {
	type: 'object',
	properties: {
		patientId: {
			type: ['integer', 'string', 'null'],
			format: 'positiveIntegerOrNull',
		},
	},
	required: ['patientId'],
};

const updateWellGuideBodySchema = {
	type: 'object',
	properties: {
		last_appointment_date: { type: 'string', format: 'validTimestamp' },
		well_guide_id: {
			type: ['integer', 'string', 'null'],
			format: 'positiveIntegerOrNull',
		},
		off_set: { type: ['string'], format: 'nonEmptyOrBlank' },
	},
	required: ['last_appointment_date', 'well_guide_id', 'off_set'],
};

const updateWellGuideBodySchemaV100 = {
	type: 'object',
	properties: {
		last_appointment_date: { type: 'string', format: 'validTimestamp' },
		well_guide_id: {
			type: ['integer', 'string', 'null'],
			format: 'positiveIntegerOrNull',
		},
		off_set: { type: ['string'], format: 'nonEmptyOrBlank' },
	},
	required: ['last_appointment_date', 'well_guide_id'],
};

const wellGuideReminderBodySchema = {
	type: 'object',
	properties: {
		reminder: { type: 'boolean' },
		well_guide_id: {
			type: ['integer', 'string', 'null'],
			format: 'positiveIntegerOrNull',
		},
	},
	required: ['reminder', 'well_guide_id'],
};

module.exports = {
	wellGuideQuerySchema,
	updateWellGuideBodySchema,
	updateWellGuideBodySchemaV100,
	wellGuideReminderBodySchema,
};
