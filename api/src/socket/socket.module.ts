import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    providers: [SocketService, SocketGateway],
    imports: [PrismaModule],
})
export class SocketModule {}
