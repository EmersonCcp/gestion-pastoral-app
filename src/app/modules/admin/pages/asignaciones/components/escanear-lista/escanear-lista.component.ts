import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';

@Component({
  selector: 'app-escanear-lista',
  templateUrl: './escanear-lista.component.html',
  styleUrls: ['./escanear-lista.component.scss'],
})
export class EscanearListaComponent {
  @Input() movimientoId: number | null = null;
  @Output() personasSeleccionadas = new EventEmitter<Persona[]>();
  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  active = false;
  scanning = false;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  errorMsg: string | null = null;

  cameraActive = false;
  videoStream: MediaStream | null = null;

  resultados: any[] = [];
  seleccionados = new Set<number>();
  todosSeleccionados = true;

  constructor(private personaService: PersonaService) {}

  toggle() {
    this.active = !this.active;
    if (!this.active) this.limpiar();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.errorMsg = null;
      this.resultados = [];
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreviewUrl = e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async iniciarCamara() {
    try {
      this.errorMsg = null;
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.cameraActive = true;
      // Wait for *ngIf to render the video element
      setTimeout(() => {
        if (this.videoRef?.nativeElement && this.videoStream) {
          this.videoRef.nativeElement.srcObject = this.videoStream;
        }
      }, 50);
    } catch {
      this.errorMsg = 'No se pudo acceder a la cámara';
    }
  }

  capturarFoto(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        this.selectedFile = new File([blob], 'captura.jpg', { type: 'image/jpeg' });
        this.imagePreviewUrl = canvas.toDataURL('image/jpeg');
        this.resultados = [];
        this.errorMsg = null;
      }
    }, 'image/jpeg');
    this.detenerCamara();
  }

  detenerCamara() {
    this.videoStream?.getTracks().forEach((t) => t.stop());
    this.videoStream = null;
    this.cameraActive = false;
  }

  escanear() {
    if (!this.selectedFile) return;
    this.scanning = true;
    this.errorMsg = null;
    this.resultados = [];

    this.personaService.scanLista(this.selectedFile).subscribe({
      next: (res: any) => {
        this.scanning = false;
        if (res.ok) {
          this.resultados = res.data || [];
          this.seleccionados = new Set(
            this.resultados.map((r: any, i: number) => i)
          );
          this.todosSeleccionados = true;
          if (!this.resultados.length) {
            this.errorMsg = 'No se detectaron nombres en la imagen. Probá con otra foto más nítida.';
          }
        } else {
          this.errorMsg = res.error?.message || 'Error al escanear la imagen';
        }
      },
      error: (err) => {
        this.scanning = false;
        this.errorMsg =
          err?.error?.error?.message || err?.message || 'Error al escanear la imagen';
      },
    });
  }

  volverACaptura() {
    this.resultados = [];
    this.seleccionados = new Set();
    this.errorMsg = null;
  }

  toggleSeleccion(idx: number) {
    if (this.seleccionados.has(idx)) {
      this.seleccionados.delete(idx);
    } else {
      this.seleccionados.add(idx);
    }
    this.todosSeleccionados = this.seleccionados.size === this.resultados.length;
  }

  toggleTodos() {
    this.todosSeleccionados = !this.todosSeleccionados;
    if (this.todosSeleccionados) {
      this.seleccionados = new Set(
        this.resultados.map((r: any, i: number) => i)
      );
    } else {
      this.seleccionados = new Set();
    }
  }

  agregarSeleccionados() {
    const personasExistentes: Persona[] = [];
    const personasNuevas: { nombre: string; apellido: string }[] = [];

    for (const idx of this.seleccionados) {
      const r = this.resultados[idx];
      if (r.existe && r.persona) {
        personasExistentes.push(r.persona);
      } else if (!r.existe) {
        personasNuevas.push({
          nombre: r.nombre || 'Sin Nombre',
          apellido: r.apellido || 'Sin Apellido',
        });
      }
    }

    if (personasExistentes.length === 0 && personasNuevas.length === 0) {
      this.errorMsg = 'No seleccionaste ningún participante';
      return;
    }

    if (personasNuevas.length > 0) {
      this.scanning = true;
      const movId = this.movimientoId || 1;

      this.personaService.crearPersonasLote(movId, personasNuevas).subscribe({
        next: (res: any) => {
          this.scanning = false;
          if (res.ok && res.data) {
            const creadas: Persona[] = res.data;
            const todas = [...personasExistentes, ...creadas];
            this.personasSeleccionadas.emit(todas);
            this.limpiar();
            this.active = false;
          } else {
            this.errorMsg = res.error?.message || 'Error al crear nuevos alumnos en la BD';
          }
        },
        error: (err) => {
          this.scanning = false;
          this.errorMsg = err?.error?.error?.message || 'Error al conectar con el servidor';
        }
      });
    } else {
      this.personasSeleccionadas.emit(personasExistentes);
      this.limpiar();
      this.active = false;
    }
  }

  private limpiar() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.resultados = [];
    this.seleccionados = new Set();
    this.errorMsg = null;
    this.detenerCamara();
  }
}
