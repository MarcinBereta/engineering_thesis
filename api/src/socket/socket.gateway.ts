import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { parse } from 'path';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SocketGuard } from 'src/auth/guards/socket.guard';
import { ContextUtils } from '@nestjs/core/helpers/context-utils';
import { Context } from '@nestjs/graphql';
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

  async handleConnection(socket: Socket) {}
  async handleDisconnect(socket: Socket) {}

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
      payload.answer,
    );
  }
}
