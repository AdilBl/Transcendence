import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomSocket } from 'src/adapters/socket.adapter';
import { ConnectedUsers } from './connectedUsers';
import { UserService } from 'src/services/user.service';
import { ChatService } from 'src/services/chat.service';
import { ChannelMessageDTO } from 'src/dto/channelMessage.dto';
import { CreateChannelDTO } from 'src/dto/createChannel.dto';
import { ChannelAdminDTO } from 'src/dto/channelAdmin.dto';
import { ChannelRestrictionDTO } from 'src/dto/channelRestriction.dto';
import { EditWhitelistDTO } from 'src/dto/editWhitelist.dto';
import { ChannelPrivacyDTO } from 'src/dto/channelPrivacy.dto';
import { ChannelPasswordDTO } from 'src/dto/channelPassword.dto';
import { JoinChannelDTO } from 'src/dto/joinChannel.dto';
import { LeaveChannelDTO } from 'src/dto/leaveChannel.dto';
import { Clients } from 'src/adapters/socket.adapter';
import { DirectMessageDTO } from 'src/dto/directMessage.dto';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private connectedUser: ConnectedUsers,
  ) {}

  //connexion
  handleConnection(client: CustomSocket) {
    console.log(`Client Connected: ${client.id}`);
    // console.log(this.connectedUser.get());
    // const decodedtoken  = await jwt.verify(client.handshake.headers.authorization, String(process.env.JWT_SECRET));
    // const TempUsersocket = await this.userService.createUsersocket(decodedtoken.nickname, client.id);
    // client.data.user = this.userService.findOneByNickname(String(decodedtoken.nickname), null);
    // this.Usersockets.push(TempUsersocket);
    // console.log(`Client Nickname: ${TempUsersocket.nickname}`);
  }

  //deconnexion

  handleDisconnect(client: CustomSocket) {
    console.log(`Client disConnected: ${client.id}`);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: CustomSocket, messageDTO: ChannelMessageDTO) {
    const Userfromchannel = await this.chatService.getParticipantsNickname(
      messageDTO.channelName,
    );
    const messageEntity = await this.chatService.registerChannelMessage(
      messageDTO,
    );
    messageDTO.sent_at = messageEntity.sent_at;
    for (const user of Userfromchannel) {
      const UserBlocked = this.userService.getBlockedNicknames(user);
      if (!(await UserBlocked).includes(messageDTO.senderNickname)) {
        this.server
          .to(Clients.getSocketId(user))
          .emit('messageAdded', messageDTO);
      }
    }
    return;
  }

  //TODO Message privée.
  @SubscribeMessage('addMessagePrivate')
  async onAddMessagePrivate(socket: CustomSocket, message: DirectMessageDTO) {
    const blockedUsers = await this.userService.getBlockedNicknames(
      message.receiverNickname,
    );
    if (!(await blockedUsers).includes(message.senderNickname)) {
      const messageEntity = await this.chatService.registerDirectMessage(
        message,
      );
      message.sent_at = messageEntity.sent_at;
      this.server
        .to(Clients.getSocketId(message.receiverNickname))
        .emit('messageprivateAdded', message);
    } else {
      this.server.to(socket.id).emit('messageprivateAdded', message);
    }
  }

  @SubscribeMessage('createChannel')
  async onCreateChannel(socket: CustomSocket, channel: CreateChannelDTO) {
    await this.chatService.createChannel(channel);
    await this.chatService.joinChannel({
      channelName: channel.channelName,
      userNickname: channel.creatorNickname,
      isAdmin: true,
      password: channel.password,
    });
    this.server.emit('createChannel'); // Ping pour que la page re Get les channel à la création d'un channel
  }

  @SubscribeMessage('AddAdmin')
  async onAddAdmin(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    newadmin: ChannelAdminDTO,
  ) {
    if (this.chatService.isAdmin(admin)) this.chatService.addAdmin(newadmin);
  }
  blockedUsers;
  @SubscribeMessage('AddRestriction')
  async onAddRestriction(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    restriction: ChannelRestrictionDTO,
  ) {
    if (this.chatService.isAdmin(admin))
      this.chatService.addRestriction(restriction);
  }

  @SubscribeMessage('AddToWhitelist')
  async onAddToWhitelist(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    whitelist: EditWhitelistDTO,
  ) {
    if (this.chatService.isAdmin(admin))
      this.chatService.addToWhitelist(whitelist);
  }

  @SubscribeMessage('RemoveToWhitelist')
  async onRemoveToWhitelist(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    whitelist: EditWhitelistDTO,
  ) {
    if (this.chatService.isAdmin(admin))
      this.chatService.addToWhitelist(whitelist);
  }

  @SubscribeMessage('ChangeChannelToPrivacy')
  async onChangeChannelToPrivacy(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    channel: ChannelPrivacyDTO,
  ) {
    if (this.chatService.isAdmin(admin))
      this.chatService.changeChannelPrivacy(channel);
  }

  @SubscribeMessage('EditChannelPassword')
  async onEditChannelPassword(
    socket: CustomSocket,
    admin: ChannelAdminDTO,
    password: ChannelPasswordDTO,
  ) {
    if (this.chatService.isAdmin(admin))
      this.chatService.editChannelPassword(password);
  }

  //TODO Invite une game

  @SubscribeMessage('InvitationGame')
  async OnInvitationGame(
    socket: CustomSocket,
    InvitationSender: string,
    InvitationReceiver: string,
  ) {
    this.server
      .to(Clients.getSocketId(InvitationReceiver))
      .emit('InvitationGame', InvitationSender);
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel(socket: CustomSocket, channel: JoinChannelDTO) {
    await this.chatService.joinChannel(channel);
    const userfromchannel: Promise<string[]> =
      this.chatService.getParticipantsNickname(channel.channelName);
    for (const user of await userfromchannel) {
      await this.server
        .to(Clients.getSocketId(user))
        .emit('joinChannel', channel);
    }
    // await this.server.to(socket.id).emit('messages', getMessageFromChannel(channel.channelName)); // envoye les messages
  }

  @SubscribeMessage('GetUserFromChannel')
  async onGetUserFromChannel(socket: CustomSocket, channel: string) {
    const Userfromchannel: Promise<string[]> =
      this.chatService.getParticipantsNickname(channel);
    const Res = await Userfromchannel;
    this.server.to(socket.id).emit('GetUserFromChannel', Res);
    // console.log(Res);
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel(socket: CustomSocket, channel: LeaveChannelDTO) {
    await this.chatService.leaveChannel(channel);
    const Userfromchannel: Promise<string[]> =
      this.chatService.getParticipantsNickname(channel.channelName);
    for (const user of await Userfromchannel) {
      await this.server.to(user).emit('leaveChannel', channel);
    }
  }
}
