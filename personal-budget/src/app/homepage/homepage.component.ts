import { AfterViewInit, Component } from '@angular/core';
import{ HttpClient } from '@angular/common/http';
import{ Chart } from 'chart.js';
import * as d3 from 'd3';
import { DataserviceService } from '../dataservice.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements AfterViewInit {
public color;
public svg;
public width;
public height;
public radius;
public pie;
public arc;
public outerArc;
public key;
public dataSource: any = {
                datasets: [
                    {
                        data: [],
                        backgroundColor: [
                            '#ffcd56',
                            '#ff6384',
                            '#36a2eb',
                            '#fd6b19',
                        ]
                    }
                ],
                labels: []
            };

  constructor(public dataService:DataserviceService) {

  }

  ngAfterViewInit(): void {
    this.dataService.getData().subscribe((data) =>{
      let data1 = [];
      let label1 = [];
      data.myBudget.map((item, key)=>{
        data1.push(item.title);
        label1.push(item.budget);
      });
      this.dataSource.datasets[0].data = label1;
      this.dataSource.labels = data1;
      this.createChart();
      this.createD3Chart(data.myBudget);
    });

  }

  createChart() {
    var ctx: any = document.getElementById('myChart');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: this.dataSource
    });
  }


createD3Chart(data) {

  d3.select(`#chart`).select('svg').remove();

  const width = 400;
  const height = 400;
  const margin = 40;
  const radius = Math.min(width, height) / 2 - margin;

  const svg = d3
    .select(`#chart`)
    .append('svg')
    .attr('width', width + 150)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie<{ title: string; budget: number }>()
    .value(d => d.budget);

  let activeData = [...data];

  const arc = d3.arc<d3.PieArcDatum<{ title: string; budget: number }>>()
    .innerRadius(radius * 0.5)
    .outerRadius(radius);

  const update = (dataToDraw: { title: string; budget: number }[]) => {
    const data_ready = pie(dataToDraw);

    const paths = svg.selectAll('path')
      .data(data_ready, (d: any) => d.data.title);

    paths.exit().remove();

    paths.transition().duration(500)
      .attr('d', arc)
      .attr('fill', (d, i) => color(String(i)));

    paths.enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(String(i)))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');
  };

  update(activeData);

  const legend = d3.select(`#chart`)
    .select('svg')
    .append('g')
    .attr('transform', `translate(${width + 10}, ${margin})`);

  data.forEach((d, i) => {
    const legendRow = legend.append('g')
      .attr('transform', `translate(0, ${i * 20})`)
      .style('cursor', 'pointer')
      .on('click', () => {
        const index = activeData.findIndex(item => item.title === d.title);
        if (index > -1) {
          activeData.splice(index, 1);
        } else {
          activeData.push(d);
        }
        update(activeData);
      });

    legendRow.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', color(String(i)));

    legendRow.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d.title)
      .attr('text-anchor', 'start')
      .style('font-size', '12px');
  });
}




}
