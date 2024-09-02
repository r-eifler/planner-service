import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs'
import path from 'path'

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


const uploadMiddleware = (req: Request, res: Response, next) => {

    upload.single('domain')
    upload.single('problem')

    const maxSize = 5 * 1024 * 1024; // 5MB
    const errors: string[] = [];

    if (req.domain.size > maxSize){
        errors.push(`Invalid file type: ${req.domain.originalname}`);
    }
    if (req.problem.size > maxSize){
        errors.push(`Invalid file type: ${req.problem.originalname}`);
    }

    // Handle validation errors
    if (errors.length > 0) {
        fs.unlinkSync(req.domain.path);
        fs.unlinkSync(req.problem.path);
        return res.status(400).json({ errors });
    }

    // Attach files to the request object
    req.files = files;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = uploadMiddleware;