import Record from '../models/recordModel.js';

// @desc    Fetch all records
// @route   GET /api/records
// @access  Public
const getRecords = async (req, res) => {
    try {
        const records = await Record.find({}).sort({ date: -1 }); // Get latest first
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new record
// @route   POST /api/records
// @access  Public
const createRecord = async (req, res) => {
    try {
        const record = new Record(req.body);
        const createdRecord = await record.save();
        res.status(201).json(createdRecord);
    } catch (error) {
        res.status(400).json({ message: 'Invalid record data', error: error.message });
    }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Public
const updateRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (record) {
            Object.assign(record, req.body);
            const updatedRecord = await record.save();
            res.json(updatedRecord);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid record data' });
    }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Public
const deleteRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (record) {
            await record.deleteOne();
            res.json({ message: 'Record removed' });
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getRecords, createRecord, updateRecord, deleteRecord };
