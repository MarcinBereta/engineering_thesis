import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const checkIfFileOrDirectoryExists = (path: string): boolean => {
  return existsSync(path);
};

const storage = diskStorage({
  destination: './public/files/courses',
  filename: (req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);

    cb(null, `${name}${extension}`);
  },
});

@Controller('files')
export class FilesController {
  @Post(':id')
  @UseInterceptors(FilesInterceptor('files[]', 10, { storage }))
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id') id: string,
  ) {}
}
