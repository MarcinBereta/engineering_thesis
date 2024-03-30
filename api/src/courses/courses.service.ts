import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, CourseInput } from './dto/CourseDTO';
import path, { extname, join } from 'path';
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  writeFile,
  createWriteStream,
} from 'fs';
import { simpleUser } from 'src/auth/dto/signup-response';
import { promisify } from 'util';

@Injectable()
export class CoursesService {
  constructor(private prismaService: PrismaService) {}

  async addCourse(course: CourseInput, user: simpleUser) {
    const newCourse = await this.prismaService.course.create({
      data: {
        name: course.name,
      },
    });
    console.log(course);
    const courseItemsToAdd = [];
    for (let i = 0; i < course.text.length; i++) {
      const src = course.text[i];
      if (src.type == 'photo') {
        console.log(src);
        const fileName = join(
          `public/${newCourse.id}`,
          `image-${i}.${course.text[i].value == 'jpg' ? 'jpeg' : course.text[i].value}`,
        );

        courseItemsToAdd.push({
          type: 'photo',
          value: fileName,
        });
      } else {
        courseItemsToAdd.push({
          type: 'text',
          value: src.value,
        });
      }
    }

    for (let courseItem of courseItemsToAdd) {
      const course = await this.prismaService.courseItem.create({
        data: {
          type: courseItem.type,
          value: courseItem.value,
          course: {
            connect: {
              id: newCourse.id,
            },
          },
        },
      });
      if (course.type == 'photo') {
        await this.prismaService.courseItem.update({
          where: {
            id: course.id,
          },
          data: {
            value:
              'files/courses/' + course.id + '.' + course.value.split('.')[1],
          },
        });
      }
    }
    return await this.prismaService.course.findUnique({
      where: {
        id: newCourse.id,
      },
      include: {
        text: true,
      },
    });
  }

  async getAllCourses() {
    return await this.prismaService.course.findMany({
      include: {
        text: true,
      },
    });
  }
}
