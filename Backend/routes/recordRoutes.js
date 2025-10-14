import express from 'express';
import {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
} from '../controllers/recordController.js';

const router = express.Router();

router.route('/')
    .get(getRecords)
    .post(createRecord);

router.route('/:id')
    .put(updateRecord)
    .delete(deleteRecord);

export default router;
