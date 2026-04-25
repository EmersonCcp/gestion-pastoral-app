import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/app/environments/environment';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private authService: AuthService, private alertService: AlertService) {
    // Determine socket URL from API URL (removing /api if present)
    const socketUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('permissions_updated', () => {
      console.log('Permissions update received via WebSocket');
      this.authService.refreshPermissions().subscribe({
        next: () => {
          console.log('Permissions refreshed successfully');
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
