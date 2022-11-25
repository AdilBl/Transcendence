import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FriendDTO } from 'src/dto/friend.dto';
import { UserDTO } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UserService } from '../services/user.service';

@Controller('user/:nickname')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findOneAction(@Param('nickname') nickname: string): Promise<UserDTO> {
    return this.userService.findOneByNickname(nickname, null);
  }

  @Put('nickname')
  @UseGuards(JwtAuthGuard)
  async editNicknameAction(
    @Param('nickname') nickname: string,
    @Body() userDTO: UserDTO,
  ): Promise<void> {
    return await this.userService.editNickname(nickname, userDTO.nickname);
  }

  @Put('avatar')
  @UseGuards(JwtAuthGuard)
  async editAvatarAction(
    @Param('nickname') nickname: string,
    @Body() userDTO: UserDTO,
  ): Promise<void> {
    return await this.userService.editAvatar(nickname, userDTO.avatar);
  }

  @Put('2fa')
  @UseGuards(JwtAuthGuard)
  async edit2faAction(
    @Param('nickname') nickname: string,
    @Body() userDTO: UserDTO,
  ): Promise<void> {
    await this.userService.edit2fa(nickname, userDTO.twofa_enabled);
  }

  @Post('friends')
  @UseGuards(JwtAuthGuard)
  async addFriendAction(
    @Param('nickname') userNickname: string,
    @Body() friendDTO: FriendDTO,
  ): Promise<UserDTO> {
    return await this.userService.addFriend(userNickname, friendDTO);
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async getFriendsAction(@Param('nickname') nickname: string) {
    return (
      await this.userService.findOneByNickname(nickname, {
        selectFriends: true,
      })
    ).friends;
  }

  @Delete('friends')
  @UseGuards(JwtAuthGuard)
  async deleteFriendAction(
    @Param('nickname') nickname: string,
    @Body() friendDTO: FriendDTO,
  ) {
    return await this.userService.deleteFriend(nickname, friendDTO);
  }
}
