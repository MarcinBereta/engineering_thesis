import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Room } from './Room';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketService {
  private queues: Map<
    string,
    {
      user: string;
      socket: Socket;
    }[]
  > = new Map();
  private rooms: Map<string, Room> = new Map();
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer() server: Server;

  getQueues() {
    return this.queues;
  }

  joinQueue(socket: Socket, quizId: string, userId: string) {
    if (!this.queues.has(quizId)) {
      this.queues.set(quizId, []);
    }

    this.createRoom(
      [
        {
          user: userId,
          socket: socket,
        },
      ],
      quizId,
    );
    // let quiz = this.queues.get(quizId)
    // if(quiz.length == 0){
    //     quiz.push({
    //         user: userId,
    //         socket: socket
    //     })
    // }else{
    //     //get 1st user in queue
    //     let user = quiz.shift()
    //     this.createRoom([user, {
    //         user:userId,
    //         socket:socket
    //     }], quizId)
    // }
  }

  async leaveQueue(socket: Socket, quizId: string, userId: string) {
    let quiz = this.queues.get(quizId);
    let userIndex = quiz.findIndex((user) => user.user === userId);
    if (userIndex != -1) {
      quiz.splice(userIndex, 1);
    }
  }

  async createRoom(
    users: {
      user: string;
      socket: Socket;
    }[],
    quizId: string,
  ) {
    let roomId = randomUUID();
    const usersData = await this.prismaService.user.findMany({
      where: {
        id: {
          in: users.map((user) => user.user),
        },
      },
    });
    const quiz = await this.prismaService.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: true,
      },
    });
    let room = new Room();
    room.questionIndex = 0;
    room.id = roomId;
    room.users = usersData.map((user) => {
      return { id: user.id, username: user.username, score: 0 };
    });
    room.quizId = quizId;
    for (let q of quiz.questions) {
      q.answers = q.answers.sort(() => Math.random() - 0.5);
    }
    room.questions = quiz.questions.sort(() => Math.random() - 0.5);
    //Select 5 random questions
    room.questions = room.questions.slice(0, 5);
    this.rooms.set(roomId, room);
    users.forEach((user) => {
      user.socket.join(roomId);
      user.socket.emit('gameStart', room);
    });
    await delay(3000);
    this.handleGameStart(roomId);
  }

  async handleGameStart(roomId: string) {
    let room = this.rooms.get(roomId);
    let question = room.questions[room.questionIndex];
    this.server.to(roomId).emit('question', question);
    await delay(5000);
    this.handleRoundEnd(roomId);
  }

  async handleRoundEnd(roomId: string) {
    let room = this.rooms.get(roomId);
    let question = room.questions[room.questionIndex];
    this.server.to(roomId).emit('questionEnd', question.correct);
    room.questionIndex++;

    await delay(1000);

    if (room.questionIndex < room.questions.length) {
      this.handleGameStart(roomId);
    } else {
      this.server.to(roomId).emit('gameEnd', room);
    }
  }

  async handleAnswer(roomId: string, userId: string, answer: string) {
    let room = this.rooms.get(roomId);
    let question = room.questions[room.questionIndex];
    if (question.correct === answer) {
      let user = room.users.find((user) => user.id === userId);
      user.score++;
    }
  }
}
