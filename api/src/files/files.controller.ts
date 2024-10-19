import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    Param,
    UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

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

const storage2 = diskStorage({
    destination: './public/files/avatars',
    filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const extension = extname(file.originalname);

        cb(null, `${name}${extension}`);
    },
});

@Controller('files')
export class FilesController {

    constructor(private prismaService: PrismaService) { }
    @Post(':id')
    @UseInterceptors(FilesInterceptor('files[]', 10, { storage }))
    uploadFile(
        @UploadedFiles() files: any,
        @Param('id') id: string,

    ) {}

    @Post('avatar/:id/:name')
    @UseInterceptors(FilesInterceptor('file', 10, { storage: storage2 }))
    async uploadAvatar(
       @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Param('name') name: string

    ) {
        await this.prismaService.user.update({
            where: {
                id: id,
            },
            data: {
                image: name,
            },
        })
    }
}
