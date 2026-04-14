import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../../environment/environment';
import { AuthStore } from '../../../auth/services/auth-store';
import { ToastrService } from 'ngx-toastr';
import { Icons } from '../../../shared/icons/icons';

@Component({
  selector: 'app-interview-room',
  standalone: true,
  imports: [CommonModule, RouterLink, Icons],
  templateUrl: './interview-room.html',
})
export class InterviewRoom implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef?: ElementRef<HTMLVideoElement>;

  interviewId = 0;
  isConnected = signal(false);
  isJoining = signal(true);
  hasRemote = signal(false);
  micEnabled = signal(true);
  cameraEnabled = signal(true);
  errorMessage = signal('');

  private connection: signalR.HubConnection | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

  constructor(
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    const idRaw = this.route.snapshot.paramMap.get('interviewId');
    this.interviewId = Number(idRaw || 0);
  }

  async ngAfterViewInit() {
    if (!this.interviewId) {
      this.errorMessage.set('Invalid interview id.');
      this.isJoining.set(false);
      return;
    }

    try {
      await this.setupLocalMedia();
      await this.setupSignalR();
      await this.joinInterview();
      this.isConnected.set(true);
    } catch (error) {
      this.errorMessage.set('Unable to join interview room. Please try again.');
      this.toastr.error('Unable to join interview room.');
      console.error(error);
    } finally {
      this.isJoining.set(false);
    }
  }

  async ngOnDestroy() {
    await this.cleanup();
  }

  toggleMic() {
    const enabled = !this.micEnabled();
    this.micEnabled.set(enabled);
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => t.enabled = enabled);
    }
    
    console.log('Mic toggled:', enabled ? 'ON' : 'OFF');
  }

  toggleCamera() {
    const enabled = !this.cameraEnabled();
    this.cameraEnabled.set(enabled);
    
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => t.enabled = enabled);
    }
    
    console.log('Camera toggled:', enabled ? 'ON' : 'OFF');
  }

  async leaveRoom() {
    await this.cleanup();
    this.isConnected.set(false);
    this.toastr.info('You left the interview room.');
  }

  private async setupLocalMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = this.localStream;
    }
  }

  private async setupSignalR() {
    const token = this.authStore.getAccessToken()?.accessToken || '';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}/hubs/interview`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ParticipantJoined', async () => {
      await this.createAndSendOffer();
    });

    this.connection.on('ReceiveOffer', async (sdp: string) => {
      await this.receiveOffer(sdp);
    });

    this.connection.on('ReceiveAnswer', async (sdp: string) => {
      await this.receiveAnswer(sdp);
    });

    this.connection.on('ReceiveIceCandidate', async (candidate: string) => {
      await this.receiveIceCandidate(candidate);
    });

    await this.connection.start();
  }

  private async joinInterview() {
    if (!this.connection) return;
    await this.connection.invoke('JoinInterview', this.interviewId);
  }

  private ensurePeerConnection() {
    if (this.peerConnection) return this.peerConnection;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      if (this.remoteVideoRef?.nativeElement && stream) {
        this.remoteVideoRef.nativeElement.srcObject = stream;
        this.hasRemote.set(true);
      }
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (!event.candidate || !this.connection) return;
      await this.connection.invoke('SendIceCandidate', this.interviewId, JSON.stringify(event.candidate));
    };

    return this.peerConnection;
  }

  private async createAndSendOffer() {
    if (!this.connection) return;
    const pc = this.ensurePeerConnection();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await this.connection.invoke('SendOffer', this.interviewId, offer.sdp || '');
  }

  private async receiveOffer(sdp: string) {
    if (!this.connection) return;
    const pc = this.ensurePeerConnection();

    await pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await this.connection.invoke('SendAnswer', this.interviewId, answer.sdp || '');
  }

  private async receiveAnswer(sdp: string) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription({ type: 'answer', sdp });
  }

  private async receiveIceCandidate(payload: string) {
    const pc = this.ensurePeerConnection();

    try {
      const parsed = JSON.parse(payload);
      await pc.addIceCandidate(new RTCIceCandidate(parsed));
    } catch {
      await pc.addIceCandidate(new RTCIceCandidate({ candidate: payload }));
    }
  }

  private async cleanup() {
    try {
      if (this.connection) {
        await this.connection.invoke('LeaveInterview', this.interviewId);
      }
    } catch {
      // Ignore leave errors during teardown.
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }

    this.hasRemote.set(false);
  }
}
