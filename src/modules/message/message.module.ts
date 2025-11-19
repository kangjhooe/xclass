import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { StorageModule } from '../storage/storage.module';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      ConversationMember,
      User,
      Student,
      Teacher,
      ClassRoom,
    ]),
    JwtModule.register({}),
    StorageModule,
  ],
  controllers: [MessageController, ConversationController],
  providers: [MessageService, ConversationService, MessagesGateway],
  exports: [MessageService, ConversationService, MessagesGateway],
})
export class MessageModule {}

