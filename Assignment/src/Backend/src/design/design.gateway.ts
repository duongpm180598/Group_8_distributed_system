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
  @WebSocketServer() server: Server; // Biến này sẽ chứa instance của Socket.IO Server

  private debouncedSaveRoomState: Map<string, (state: any) => void> = new Map();
  private roomCanvasStates: Map<string, any> = new Map();

  onModuleInit() {}

  afterInit(server: Server) {
    console.log('Socket Gateway Initialized!', server);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: any[]) {
    // console.log(`Client connected: ${client.id}`);
    // if (this.currentCanvasState) {
    //   client.emit('canvasRestored', this.currentCanvasState);
    // } else {
    //   client.emit('canvasRestored', []);
    // }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private initDebouncedSaveForRoom(roomId: string) {
    if (!this.debouncedSaveRoomState.has(roomId)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const debouncedFn = debounce(async (state: any) => {
        console.log(
          `--- Saving full canvas snapshot for room ${roomId} to DB ---`,
        );
        // TODO: Thực hiện logic lưu trạng thái canvas của phòng này vào DB
        // Ví dụ: await this.roomService.saveRoomState(roomId, state);
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.debouncedSaveRoomState.set(roomId, debouncedFn);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
        console.log(`${client.id} left room ${room}`);
      }
    });
    if (!this.roomCanvasStates.has(roomId)) {
      this.roomCanvasStates.set(roomId, []);
      this.initDebouncedSaveForRoom(roomId);
      console.log(`Initialized new room: ${roomId}`);
    }
    const currentRoomState = this.roomCanvasStates.get(roomId);
    client.emit('canvasRestored', currentRoomState);
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
    const currentRoomState = this.roomCanvasStates.get(roomId); // Lấy lại để đảm bảo là bản mới nhất

    const payload = { roomId, canvasState: currentRoomState };
    client.broadcast.emit('canvasUpdated', payload);
    const debouncedSaveFn = this.debouncedSaveRoomState.get(roomId);
    if (debouncedSaveFn) {
      debouncedSaveFn(currentRoomState);
    }
  }

  // Lắng nghe sự kiện khi client gửi một đối tượng mới được thêm vào
  @SubscribeMessage('addObject')
  handleAddObject(
    @MessageBody() objectData: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Received new object from ${client.id}:`, objectData);
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
    console.log(`Received object modification from ${client.id}:`, objectData);
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
    console.log(`Received object deletion from ${client.id}:`, objectId);
    this.server.emit('objectDeleted', {
      objectId: objectId,
      senderId: client.id,
    });
  }
}
