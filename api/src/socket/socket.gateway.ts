import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { SocketGuard } from 'src/auth/guards/socket.guard';
import { SocketService } from './socket.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    public server: Server;
    constructor(private socketService: SocketService) {}

    async handleConnection() {}
    async handleDisconnect() {}

    @SubscribeMessage('connectToOwnRoom')
    @UseGuards(SocketGuard)
    async handleConnectToOwnRoom(socket: Socket, payload: any) {
        console.log('Joined room: ', payload.userId);
        socket.join(payload.userId);
    }

    @SubscribeMessage('fightWithFriend')
    @UseGuards(SocketGuard)
    async handleFightInvite(socket: Socket, payload: any) {
        console.log('fight with', payload.username);
        this.socketService.fightWithFriend(
            socket,
            payload.quizId,
            payload.userId,
            payload.friendId,
            payload.username
        );
    }

    @SubscribeMessage('acceptFight')
    @UseGuards(SocketGuard)
    async handleAcceptFight(socket: Socket, payload: any) {
        this.socketService.acceptFight(
            socket,
            payload.userId,
            payload.friendId
        );
    }

    @SubscribeMessage('declineFight')
    @UseGuards(SocketGuard)
    async handleDeclineFight(socket: Socket, payload: any) {
        this.socketService.declineFight(
            socket,
            payload.userId,
            payload.friendId
        );
    }

    @SubscribeMessage('joinQueue')
    @UseGuards(SocketGuard)
    async handleJoinQueue(socket: Socket, payload: any) {
        // console.log(payload)
        this.socketService.joinQueue(socket, payload.quizId, payload.userId);
    }

    @SubscribeMessage('leaveQueue')
    @UseGuards(SocketGuard)
    async handleLeaveQueue(socket: Socket, payload: any) {
        this.socketService.leaveQueue(socket, payload.quizId, payload.userId);
    }

    @SubscribeMessage('answer')
    @UseGuards(SocketGuard)
    async handleAnswer(socket: Socket, payload: any) {
        this.socketService.handleAnswer(
            payload.roomId,
            payload.userId,
            payload.answer
        );
    }
}
