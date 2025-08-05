import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { debounce } from 'lodash';
import { Server, Socket } from 'socket.io';
import { DesignsService } from './design.service';

interface RoomUser {
  id: string; // Socket ID của user
  username?: string;
  avatar: string;
}

// @WebSocketGateway() decorator sẽ mặc định chạy trên cổng 3000 (cùng với ứng dụng NestJS).
// Nếu bạn muốn chạy trên một cổng khác hoặc cấu hình CORS, hãy thêm các tùy chọn:
@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép tất cả các origin kết nối, trong môi trường production nên chỉ định rõ các origin cụ thể.
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // port: 4000 // Bạn có thể chỉ định cổng riêng cho WebSocket nếu cần
})
export class DesignGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  constructor(private designService: DesignsService) {}

  @WebSocketServer() server: Server; // Biến này sẽ chứa instance của Socket.IO Server

  private debouncedSaveRoomState: Map<string, (state: any) => void> = new Map();
  private roomCanvasStates: Map<string, any> = new Map();
  private roomUsers: Map<string, RoomUser[]> = new Map();

  onModuleInit() {}

  afterInit() {
    console.log('Socket Gateway Initialized!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.roomUsers.forEach((usersInRoom, roomId) => {
      const currentUsersInRoom = this.roomUsers.get(roomId) ?? [];

      const initialCount = currentUsersInRoom.length;
      const updatedUsersInRoom = currentUsersInRoom.filter(
        (user) => user.id !== client.id,
      );

      this.roomUsers.set(roomId, updatedUsersInRoom);

      if (updatedUsersInRoom.length < initialCount) {
        this.server.to(roomId).emit('roomUsersUpdated', updatedUsersInRoom);
      }
    });
  }

  private initDebouncedSaveForRoom(roomId: string) {
    if (!this.debouncedSaveRoomState.has(roomId)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const debouncedFn = debounce(async (state) => {
        // console.log(
        //   `--- Saving full canvas snapshot ${JSON.stringify(state)} to DB ---`,
        // );
        const payload = { ...state, designId: roomId };

        await this.designService.createOrUpdate(payload);
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.debouncedSaveRoomState.set(roomId, debouncedFn);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; username: string; avatar: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId, username, avatar } = data;
    const userId = client.id;
    client.rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
        // console.log(`${client.id} left room ${room}`);

        const oldRoomUsers = this.roomUsers.get(room) ?? [];
        if (oldRoomUsers.length > 0) {
          this.roomUsers.set(
            room,
            oldRoomUsers.filter((user) => user.id !== userId),
          );
          this.server
            .to(room)
            .emit('roomUsersUpdated', this.roomUsers.get(room));
        }
      }
    });

    client.join(roomId);

    if (!this.roomCanvasStates.has(roomId)) {
      const design = await this.designService.findOneById(roomId);
      if (design) {
        this.roomCanvasStates.set(roomId, design.canvas);
      } else {
        this.roomCanvasStates.set(roomId, {
          objects: [],
          background: '#ffffff',
        });
      }
    }

    // Ensure the roomUsers entry exists before pushing
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, []);
    }

    const currentUserList = this.roomUsers.get(roomId); // Now guaranteed not to be undefined
    if (currentUserList) {
      const userExists = currentUserList.some((user) => user.id === userId);
      if (!userExists) {
        currentUserList.push({ id: userId, username, avatar });
        this.roomUsers.set(roomId, currentUserList);
      }
    }

    const currentRoomState = this.roomCanvasStates.get(roomId);
    client.emit('canvasRestored', currentRoomState);

    this.server.to(roomId).emit('roomUsersUpdated', currentUserList);
    // console.log(
    //   `Room ${roomId} users updated. Current count: ${currentUserList?.length}`,
    // );
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(room);
    console.log(`Client ${client.id} left room: ${room}`);
    this.server
      .to(room)
      .emit('roomMessage', `${client.id} has left the room ${room}`);
  }

  @SubscribeMessage('updateCanvas')
  handleCanvasUpdate(
    @MessageBody() data: { roomId: string; canvasState: any },
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, canvasState } = data;

    if (!this.roomCanvasStates.has(roomId)) {
      console.warn(`Attempted to update non-existent room: ${roomId}`);
      return;
    }

    this.roomCanvasStates.set(roomId, canvasState);
    const currentRoomState = this.roomCanvasStates.get(roomId);

    const payload = { roomId, canvasState: currentRoomState };
    client.broadcast.emit('canvasUpdated', payload);
    // const debouncedSaveFn = this.debouncedSaveRoomState.get(roomId);
    // if (debouncedSaveFn) {
    //   debouncedSaveFn(currentRoomState);
    // }
  }

  // Lắng nghe sự kiện khi client gửi một đối tượng mới được thêm vào
  @SubscribeMessage('addObject')
  handleAddObject(
    @MessageBody() objectData: any,
    @ConnectedSocket() client: Socket,
  ): void {
    // console.log(`Received new object from ${client.id}:`, objectData);
    this.server.emit('objectAdded', {
      object: objectData,
      senderId: client.id,
    });
  }

  // Lắng nghe sự kiện khi client gửi một đối tượng bị thay đổi
  @SubscribeMessage('modifyObject')
  handleModifyObject(
    @MessageBody() objectData: any,
    @ConnectedSocket() client: Socket,
  ): void {
    // console.log(`Received object modification from ${client.id}:`, objectData);
    this.server.emit('objectModified', {
      object: objectData,
      senderId: client.id,
    });
  }

  // Lắng nghe sự kiện khi client gửi một đối tượng bị xóa
  @SubscribeMessage('deleteObject')
  handleDeleteObject(
    @MessageBody() objectId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    // console.log(`Received object deletion from ${client.id}:`, objectId);
    this.server.emit('objectDeleted', {
      objectId: objectId,
      senderId: client.id,
    });
  }
}
