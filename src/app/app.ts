  import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { IotSimulationService } from './core/iot-simulation/iot-simulation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatCardModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('carga-safe');

  // Injecting it here (root component, created once at bootstrap) starts the
  // shared IoT simulation loop immediately, so sensor data / alerts keep
  // flowing in the background no matter which screen the user is on.
  private readonly iotSimulation = inject(IotSimulationService);
}
