import express from 'express';
import { celebrate, Segments } from 'celebrate';

import { authenticate } from '../middlewares/authenticate.js';

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/notes',
  celebrate({ [Segments.QUERY]: getAllNotesSchema }),
  getAllNotes
);

router.get(
  '/notes/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  getNoteById
);

router.post(
  '/notes',
  celebrate({ [Segments.BODY]: createNoteSchema }),
  createNote
);

router.delete(
  '/notes/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  deleteNote
);

router.patch(
  '/notes/:noteId',
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
    [Segments.BODY]: updateNoteSchema,
  }),
  updateNote
);

export default router;
