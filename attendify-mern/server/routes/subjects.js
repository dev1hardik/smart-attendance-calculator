const express = require('express');
const mongoose = require('mongoose');
const { Subject } = require('../models/Models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All subject routes require authentication
router.use(protect);

// ─── GET /api/subjects — Fetch all subjects for user, sorted by code ────────────
router.get('/', async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ code: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/subjects/summary — Aggregated attendance summary ──────────────────
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await Subject.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          totalAttended: { $sum: { $add: ['$present', '$od', '$makeup'] } },
          totalConducted: { $sum: { $add: ['$present', '$od', '$absent'] } },
          subjectCount: { $sum: 1 },
          shortageCount: {
            $sum: {
              $cond: [
                {
                  $lt: [
                    {
                      $cond: [
                        { $eq: [{ $add: ['$present', '$od', '$absent'] }, 0] },
                        1,
                        {
                          $divide: [
                            { $add: ['$present', '$od', '$makeup'] },
                            { $add: ['$present', '$od', '$absent'] },
                          ],
                        },
                      ],
                    },
                    0.75,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    if (summary.length === 0) {
      return res.status(200).json({
        totalAttended: 0,
        totalConducted: 0,
        overallPercentage: 0,
        subjectCount: 0,
        shortageCount: 0,
      });
    }

    const { totalAttended, totalConducted, subjectCount, shortageCount } = summary[0];
    const overallPercentage =
      totalConducted === 0
        ? 0
        : parseFloat(((totalAttended / totalConducted) * 100).toFixed(2));

    res.status(200).json({
      totalAttended,
      totalConducted,
      overallPercentage,
      subjectCount,
      shortageCount,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/subjects/bulk-import — Upsert multiple subjects ──────────────────
router.post('/bulk-import', async (req, res, next) => {
  try {
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'subjects array is required and must not be empty' });
    }

    const operations = subjects.map((subj) => ({
      updateOne: {
        filter: { userId: new mongoose.Types.ObjectId(req.user.id), code: subj.code.toUpperCase() },
        update: {
          $set: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            code: subj.code.toUpperCase(),
            name: subj.name,
            type: subj.type,
            stepWeight: subj.stepWeight || (subj.type === 'Lab' ? 2 : 1),
            present: subj.present || 0,
            od: subj.od || 0,
            makeup: subj.makeup || 0,
            absent: subj.absent || 0,
          },
        },
        upsert: true,
      },
    }));

    const result = await Subject.bulkWrite(operations);

    res.status(200).json({
      message: 'Bulk import successful',
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/subjects/single — Create a single subject ────────────────────────
router.post('/single', async (req, res, next) => {
  try {
    const { code, name, type, stepWeight, present, od, makeup, absent } = req.body;

    if (!code || !name || !type) {
      return res.status(400).json({ message: 'code, name, and type are required' });
    }

    const subject = await Subject.create({
      userId: req.user.id,
      code,
      name,
      type,
      stepWeight: stepWeight || (type === 'Lab' ? 2 : 1),
      present: present || 0,
      od: od || 0,
      makeup: makeup || 0,
      absent: absent || 0,
    });

    res.status(201).json(subject);
  } catch (error) {
    // Handle duplicate key error (compound index userId + code)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }
    next(error);
  }
});

// ─── PUT /api/subjects/:id/mark — Increment attendance field by stepWeight ──────
router.put('/:id/mark', async (req, res, next) => {
  try {
    const { field } = req.body;
    const validFields = ['present', 'absent', 'od', 'makeup'];

    if (!field || !validFields.includes(field)) {
      return res.status(400).json({
        message: `field is required and must be one of: ${validFields.join(', ')}`,
      });
    }

    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject[field] += subject.stepWeight;
    const updatedSubject = await subject.save();

    res.status(200).json(updatedSubject);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/subjects/:id/unmark — Decrement attendance field by stepWeight ────
router.put('/:id/unmark', async (req, res, next) => {
  try {
    const { field } = req.body;
    const validFields = ['present', 'absent', 'od', 'makeup'];

    if (!field || !validFields.includes(field)) {
      return res.status(400).json({
        message: `field is required and must be one of: ${validFields.join(', ')}`,
      });
    }

    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Decrement but never go below 0
    subject[field] = Math.max(0, subject[field] - subject.stepWeight);
    const updatedSubject = await subject.save();

    res.status(200).json(updatedSubject);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/subjects/:id — Full update of a subject ───────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const allowedFields = ['code', 'name', 'type', 'stepWeight', 'present', 'od', 'makeup', 'absent'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        subject[field] = req.body[field];
      }
    });

    const updatedSubject = await subject.save();
    res.status(200).json(updatedSubject);
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/subjects/all — Delete all subjects for the user ────────────────
router.delete('/all', async (req, res, next) => {
  try {
    const result = await Subject.deleteMany({ userId: req.user.id });
    res.status(200).json({ message: 'All subjects deleted', deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/subjects/:id — Delete a single subject ─────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ message: 'Subject deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
