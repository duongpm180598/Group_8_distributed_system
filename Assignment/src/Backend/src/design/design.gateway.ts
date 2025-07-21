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
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server; // Biến này sẽ chứa instance của Socket.IO Server

  // onGatewayInit được gọi sau khi gateway được khởi tạo
  afterInit(server: Server) {
    console.log('Socket Gateway Initialized!', server);
  }

  // onGatewayConnection được gọi khi một client kết nối
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    // Gửi một tin nhắn chào mừng đến client mới kết nối
    client.emit('connectionSuccess', `Welcome, your ID is ${client.id}`);
  }

  // onGatewayDisconnect được gọi khi một client ngắt kết nối
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage lắng nghe các sự kiện từ client
  @SubscribeMessage('sendMessage') // Lắng nghe sự kiện 'sendMessage' từ client
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Message from ${client.id}: ${data}`);
    // Gửi tin nhắn này đến tất cả các client đang kết nối (broadcast)
    this.server.emit('receiveMessage', { senderId: client.id, message: data });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
    this.server
      .to(room)
      .emit('roomMessage', `${client.id} has joined the room ${room}`);
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

  // Lắng nghe sự kiện khi client gửi toàn bộ trạng thái canvas
  @SubscribeMessage('updateCanvas')
  handleCanvasUpdate(
    @MessageBody() canvasState: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Received canvas update from ${client.id}`);
    // Phát lại trạng thái canvas cho tất cả các client khác TRONG CÙNG PHÒNG
    // Nếu bạn muốn chia sẻ với tất cả, dùng this.server.emit
    // Để chỉ phát trong phòng, bạn cần quản lý phòng (ví dụ: client.join('design-room'))
    console.log(canvasState);
    this.server.emit('canvasUpdated', canvasState); // Phát cho tất cả
    // Nếu dùng phòng: this.server.to('design-room').emit('canvasUpdated', canvasState);
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
