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
    .kpi { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .kpi p { font-size: 3rem; font-weight: bold; color: #28a745; }
  `]
})
export class Estadisticas implements OnInit {
  private statsService = inject(EstadisticasService);

  fechaDesde = signal(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  fechaHasta = signal(new Date().toISOString().split('T')[0]);

  totalComentarios = signal(0);

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
     y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,  // <--- Esto fuerza pasos de 1 en 1
        precision: 0  // <--- Esto evita decimales
      }
    }}
  };
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Publicaciones' }] };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,  // <--- Idem: pasos de 1
          precision: 0  // <--- Idem: sin decimales
        }
      }
    }
  };

  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Comentarios' }] };

  ngOnInit() {
    this.generarReporte();
  }

  generarReporte() {
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    // Gráfico Barras
    this.statsService.getPublicacionesPorUsuario(desde, hasta).subscribe(data => {
      this.barChartData = {
        labels: data.map(d => d.nombreUsuario),
        datasets: [{ data: data.map(d => d.cantidad), label: 'Publicaciones', backgroundColor: '#007bff' }]
      };
    });

    // Gráfico Torta (Comentarios realizados por usuario)
    
    this.statsService.getComentariosPorUsuario(desde, hasta).subscribe(data => {
      this.pieChartData = {
        labels: data.map(d => d.nombreUsuario), // Nombre de quien comenta
        datasets: [{ 
          data: data.map(d => d.cantidad), // Cuántos comentarios hizo
          backgroundColor: [ // Colores opcionales para la torta
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }]
      };
    });

    // KPI Número total
    this.statsService.getComentariosTotales(desde, hasta).subscribe(data => {
      this.totalComentarios.set(data.cantidad);
    });

    // Gráfico Líneas (Comentarios por publicación)
    this.statsService.getComentariosPorPublicacion(desde, hasta).subscribe(data => {
      this.lineChartData = {
        labels: data.map(d => d.tituloPublicacion),
        datasets: [{ 
          data: data.map(d => d.cantidad), 
          label: 'Comentarios por Publicación', 
          borderColor: 'red', 
          backgroundColor: 'rgba(255,0,0,0.3)',
          tension: 0.1 
        }]
      };
    });
  }
}