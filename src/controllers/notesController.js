import Note from '../models/note.js';
import createHttpError from 'http-errors';

const ALLOWED_FIELDS = ['title', 'content', 'tag'];

export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search } = req.query;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;

    const filter = { userId: req.user._id }; 
    if (tag) filter.tag = tag;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * perPage;

    let findQuery = Note.find(filter);

    if (search) {
      findQuery = findQuery
        .select({
          score: { $meta: 'textScore' },
          title: 1,
          content: 1,
          tag: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .sort({ score: { $meta: 'textScore' } });
    } else {
      findQuery = findQuery
        .select({
          title: 1,
          content: 1,
          tag: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .sort({ createdAt: -1 });
    }

    const pagedQuery = findQuery.skip(skip).limit(perPage);

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      pagedQuery.exec(),
    ]);

    const totalPages = totalNotes === 0 ? 0 : Math.ceil(totalNotes / perPage);

    return res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id }).exec();
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const payload = { userId: req.user._id }; 
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        payload[key] = req.body[key];
      }
    }

    const newNote = await Note.create(payload);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: req.user._id }).exec();
    if (!deletedNote) throw createHttpError(404, 'Note not found');
    res.status(200).json(deletedNote);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const update = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        update[key] = req.body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      throw createHttpError(400, 'Request body must contain at least one of: title, content, tag');
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      update,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedNote) throw createHttpError(404, 'Note not found');
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};
