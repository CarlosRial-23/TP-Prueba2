import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../../services/estadisticas.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './estadisticas.html',
  styles: [`
    .filtros { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
    .graficos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card-grafico { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
  `]
})
export class Estadisticas implements OnInit {
  private statsService = inject(EstadisticasService);

  fechaDesde = signal(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  fechaHasta = signal(new Date().toISOString().split('T')[0]);

  totalComentarios = signal(0);

  barChartOptions: ChartConfiguration['options'] = { responsive: true };
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Publicaciones' }] };

  pieChartOptions: ChartConfiguration['options'] = { responsive: true };
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };

  ngOnInit() {
    this.generarReporte();
  }

  generarReporte() {
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    this.statsService.getPublicacionesPorUsuario(desde, hasta).subscribe(data => {
      this.barChartData = {
        labels: data.map(d => d.nombreUsuario),
        datasets: [{ data: data.map(d => d.cantidad), label: 'Publicaciones', backgroundColor: '#007bff' }]
      };
    });

    this.statsService.getComentariosTotales(desde, hasta).subscribe(data => {
      this.totalComentarios.set(data.cantidad);
    });

    this.statsService.getComentariosPorPublicacion(desde, hasta).subscribe(data => {
      this.pieChartData = {
        labels: data.map(d => d.tituloPublicacion),
        datasets: [{ data: data.map(d => d.cantidad) }]
      };
    });
  }
}