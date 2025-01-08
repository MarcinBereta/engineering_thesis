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

    private waiting: Map<
        string,
        {
            quizId: string;
            friendId: string;
            socket: Socket;
        }
    > = new Map();
    private rooms: Map<string, Room> = new Map();
    constructor(private prismaService: PrismaService) { }
    @WebSocketServer() server: Server;

    getQueues() {
        return this.queues;
    }

    joinQueue(socket: Socket, quizId: string, userId: string) {
        if (!this.queues.has(quizId)) {
            this.queues.set(quizId, []);
        }

        const quiz = this.queues.get(quizId);
        if (quiz.length == 0) {
            quiz.push({
                user: userId,
                socket: socket,
            });
        } else {
            const user = quiz.shift();
            this.createRoom(
                [
                    user,
                    {
                        user: userId,
                        socket: socket,
                    },
                ],
                quizId
            );
        }
    }

    async fightWithFriend(
        socket: Socket,
        quizId: string,
        userId: string,
        friendId: string,
        username: string
    ) {
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
        });
        this.waiting.set(userId, {
            quizId,
            friendId,
            socket,
        });
        this.server.to(friendId).emit('fightWithFriend', {
            userId,
            quizId,
            userName: username,
            quiz,
        });
    }

    async acceptFight(socket: Socket, userId: string, friendId: string) {
        const data = this.waiting.get(friendId);
        if (data.friendId == userId)
            this.createRoom(
                [
                    {
                        user: userId,
                        socket: socket,
                    },
                    {
                        user: friendId,
                        socket: data.socket,
                    },
                ],
                data.quizId
            );
    }

    async declineFight(socket: Socket, userId: string, friendId: string) {
        const data = this.waiting.get(friendId);
        if (data.friendId == userId) {
            data.socket.emit('fightCanceled');
        }
    }

    async leaveQueue(socket: Socket, quizId: string, userId: string) {
        const quiz = this.queues.get(quizId);
        const userIndex = quiz.findIndex((user) => user.user === userId);
        if (userIndex != -1) {
            quiz.splice(userIndex, 1);
        }
    }

    async createRoom(
        users: {
            user: string;
            socket: Socket;
        }[],
        quizId: string
    ) {
        const roomId = randomUUID();
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
        const room = new Room();
        room.questionIndex = 0;
        room.id = roomId;
        room.users = usersData.map((user) => {
            return { id: user.id, username: user.username, score: 0 };
        });
        room.quizId = quizId;
        for (const q of quiz.questions) {
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
        const room = this.rooms.get(roomId);
        const question = room.questions[room.questionIndex];
        this.server.to(roomId).emit('question', question);
        await delay(5000);
        this.handleRoundEnd(roomId);
    }

    async handleRoundEnd(roomId: string) {
        const room = this.rooms.get(roomId);
        const question = room.questions[room.questionIndex];
        this.server.to(roomId).emit('questionEnd', question.correct);
        room.questionIndex++;

        await delay(1000);

        if (room.questionIndex < room.questions.length) {
            this.handleGameStart(roomId);
        } else {
            this.server.to(roomId).emit('gameEnd', room);
        }
    }

    async handleAnswer(roomId: string, userId: string, answer: string[]) {
        const room = this.rooms.get(roomId);
        const question = room.questions[room.questionIndex];
        let isCorrect = true;
        if (question.type === 'MULTIPLE_ANSWER') {
            isCorrect = question.correct.every((correct) =>
                answer.includes(correct)
            );
        } else {
            isCorrect = question.correct.every((correct) =>
                answer.includes(correct)
            );
        }
        if (isCorrect) {
            const user = room.users.find((user) => user.id === userId);
            user.score++;
        }
    }

    async refreshUserData(userId: string) {
        console.log('refreshing user data');
        console.log(userId);
        this.server.to(userId).emit('refreshUserData')
    }
}
