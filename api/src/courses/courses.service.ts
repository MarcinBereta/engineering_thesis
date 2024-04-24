import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, CourseInput, EditCourseInput } from './dto/CourseDTO';
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

  async processCourse(course: EditCourseInput | CourseInput, id: string) {
    const courseItemsToAdd = [];
    for (let i = 0; i < course.text.length; i++) {
      const src = course.text[i];
      if (src.type == 'photo') {
        if (src.value.includes('files/courses/')) {
          courseItemsToAdd.push({
            type: 'photo',
            value: src.value,
            id: src.id,
          });
        } else {
          const fileName = join(
            `public/${id}`,
            `image-${i}.${course.text[i].value == 'jpg' ? 'jpeg' : course.text[i].value}`,
          );

          courseItemsToAdd.push({
            type: 'photo',
            value: fileName,
          });
        }
      } else {
        courseItemsToAdd.push({
          type: 'text',
          value: src.value,
        });
      }
    }

    for (let courseItem of courseItemsToAdd) {
      if (
        courseItem.type == 'photo' &&
        courseItem.value.includes('files/courses/')
      ) {
        await this.prismaService.courseItem.create({
          data: {
            type: courseItem.type,
            value: courseItem.value,
            id: courseItem.id,
            course: {
              connect: {
                id: id,
              },
            },
          },
        });
      } else {
        const addedCourseItem = await this.prismaService.courseItem.create({
          data: {
            type: courseItem.type,
            value: courseItem.value,
            course: {
              connect: {
                id: id,
              },
            },
          },
        });
        if (addedCourseItem.type == 'photo') {
          await this.prismaService.courseItem.update({
            where: {
              id: addedCourseItem.id,
            },
            data: {
              value:
                'files/courses/' +
                addedCourseItem.id +
                '.' +
                addedCourseItem.value.split('.')[1],
            },
          });
        }
      }
    }
  }

  async addCourse(course: CourseInput, user: simpleUser) {
    if (!user.verified) {
      throw new Error('User is not verified');
    }
    const newCourse = await this.prismaService.course.create({
      data: {
        name: course.name,
        creatorId: user.id,
      },
    });

    await this.processCourse(course, newCourse.id);

    return await this.prismaService.course.findUnique({
      where: {
        id: newCourse.id,
      },
      include: {
        text: true,
      },
    });
  }

  async editCourse(course: EditCourseInput, user: simpleUser) {
    if (!user.verified) {
      throw new Error('User is not verified');
    }
    const courseToEdit = await this.prismaService.course.findUnique({
      where: {
        id: course.id,
      },
    });

    if (courseToEdit.creatorId !== user.id) {
      throw new Error('User is not the creator of the course');
    }

    await this.prismaService.course.update({
      where: {
        id: course.id,
      },
      data: {
        name: course.name,
      },
    });

    await this.prismaService.courseItem.deleteMany({
      where: {
        courseId: course.id,
      },
    });
    await this.processCourse(course, course.id);

    return await this.prismaService.course.findUnique({
      where: {
        id: course.id,
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
      where: {
        verified: true,
      },
    });
  }

  async getMyCourses(id: string) {
    return await this.prismaService.course.findMany({
      where: {
        creatorId: id,
      },
      include: {
        text: true,
      },
    });
  }

  async getUnVerifiedCourses() {
    return await this.prismaService.course.findMany({
      where: {
        verified: false,
      },
      include: {
        text: true,
      },
    });
  }

  async verifyCourse(courseId: string) {
    console.log(courseId);
    return await this.prismaService.course.update({
      where: {
        id: courseId,
      },
      data: {
        verified: true,
      },
    });
  }
}
