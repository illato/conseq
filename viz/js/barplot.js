/** Class implementing the table. */
class Barplot {
    /**
     * Creates a Table Object
     */
  constructor(binData) {

    this.initializeBarPlot();
    this.drawBarPlot(binData);

  }

  initializeBarPlot(){

    this.initializeFocus();
    this.initializeContext();

  }

  initializeFocus() {

    let focus = d3.select('#Barchart-div')
      .append('svg')
      .attr('id', 'Barchart-svg');

    this.initializeBarZoom(); // behind bars => bar:hover & zoom both work

    focus.append('g')
      .attr('id', 'Barchart-x-axis')

    focus.append('g')
      .attr('id', 'Barchart-y-axis');

    focus.append('g')
      .attr('id', 'BarChart')
      .attr('class', 'bar-chart');

    focus.append('g')
      .attr('id', 'text-hover-box')
      .append('rect');

    this.initializeClipPath();

  }

  initializeContext() {

    let context = d3.select('#Barchart-div')
      .append('svg')
      .attr('id', 'Barchart-svg-context')
      .append('g')
        .attr('id', 'BarChartContext');

    context.append('g')
      .attr('id', 'Barchart-context-x-axis');

    context.append('g')
      .attr('id', 'Barchart-context-bars');

    context.append('g')
      .attr('id', 'Barchart-context');

  }

  drawBarPlot(binData){

    this.data = d3.group(binData, d => d.start);

    const maxLength = d3.max([...this.data.values()], n => n.length);

    this.yScale = d3.scaleLinear()
      .domain([0, maxLength])
      .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
      .nice();

    this.y2 = d3.scaleLinear()
      .domain(this.yScale.domain())
      .range([BAR_CONTEXT_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
      .nice();

    this.xScale = d3.scaleLinear()
      .domain([0, globalApplicationState.seq.length])
      .range([MARGIN.left, CHART_WIDTH-MARGIN.right])
      .nice();

    this.x2 = d3.scaleLinear()
      .domain(this.xScale.domain())
      .range([MARGIN.left, CHART_WIDTH-MARGIN.right])
      .nice();

    this.xAxis = d3.axisBottom(this.xScale);
    this.xAxis2 = d3.axisBottom(this.x2);

    this.addYAxis();
    this.addXAxis();
    this.drawBars();
    this.drawMiniBars();
    this.setupBrush();
    this.setupZoom();
    this.setupHoverSequenceView();

  }

  setupHoverSequenceView(){
    d3.select('#Barchart-svg')
    .on('mousemove', (e) => {
      let v = d3.pointer(e);
      //console.log(v);
      let x = v[0];

      const bpHoverTarget = this.xScale.invert(x);
      const radius = 5;

      if (x > MARGIN.left && x < CHART_WIDTH - MARGIN.right) {
        // Set the line position
        d3.select('#text-hover-box')
          .select('rect')
          .attr('stroke', 'none')
          .attr('fill', 'grey')
          .attr('opacity', 0.5)
          .attr('width', Math.abs(this.xScale(bpHoverTarget - radius) - this.xScale(bpHoverTarget + radius)))
          .attr('x', this.xScale(bpHoverTarget - radius))
          .attr('y', CHART_HEIGHT - MARGIN.bottom)
          .attr('height', MARGIN.bottom);

      }
    })
    .on('mouseout', (e) => {
      d3.select('#text-hover-box')
        .select('rect')
        .attr('stroke', 'none')
        .attr('fill', 'none')
    }
  );

  }

  setupZoom() {

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [CHART_WIDTH, CHART_HEIGHT]])
      .extent([[0, 0], [CHART_WIDTH, CHART_HEIGHT]])
      .on('zoom', (e) => {
        // bail out if brush per this is zoom
        if (e.sourceEvent && e.sourceEvent.type === 'brush')
          return;

        // re-size context brush
        // re-scale focus x-scale's domain
        let t = e.transform;
        this.xScale.domain(t.rescaleX(this.x2).domain());

        // re-position bars
        d3.select('#BarChart').selectAll('rect').attr('x', d => this.xScale(d[0]));

        // re-scale focus x-axis
        d3.select('#Barchart-x-axis')
          .call(this.xAxis);

        // re-position context brush
        d3.select('#Barchart-context')
          .call(this.brush.move, this.xScale.range().map(t.invertX, t));

      });

    d3.select('#bar-zoom')
      .call(this.zoom);

  }

  setupBrush() {

    this.brush = d3.brushX()
      .extent([[MARGIN.left, 0], [CHART_WIDTH - MARGIN.right, BAR_CONTEXT_HEIGHT - MARGIN.bottom]])
      .on('brush end', (e) => {
        // bail out if zoom per this is brush
        if (e.sourceEvent && e.sourceEvent.type === 'zoom')
          return;

        // update focus x-scale domain
        let sel = e.selection || this.x2.range();
        this.xScale.domain(sel.map(this.x2.invert, this.x2));

        // re-draw bars
        this.drawBars();

        // re-position x-axis
        d3.select('#Barchart-x-axis')
          .call(this.xAxis);
      });

    d3.select('#Barchart-context')
      .classed('brush', true)
      .call(this.brush)
      .call(this.brush.move, this.xScale.range());

  }

  addXAxis() {

    d3.select('#Barchart-x-axis')
      .classed('barchart-x-axis', true)
      .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
      .call(this.xAxis);

  }

  addContextXAxis() {

    d3.select('#Barchart-context-x-axis')
      .attr('transform', `translate(0,${BAR_CONTEXT_HEIGHT - MARGIN.bottom})`)
      .call(this.xAxis2);

  }

  addYAxis() {

    d3.select('#Barchart-y-axis')
      .call(d3.axisLeft(this.yScale))
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  }

  drawMiniBars() {
    this.addContextXAxis()

    d3.select('#Barchart-context-bars')
      .selectAll('rect')
      .data(this.data)
      .join('rect')
      .attr('width', 2)
      .attr('x', d => this.x2(d[0]))
      .attr('y', d => this.y2(d[1].length) + MARGIN.top)
      .attr('height', d => this.y2(0) - this.y2(d[1].length))
      .attr('id', d => d.start)
      .attr('opacity', 1)
      .classed('bar-chart-bar', true);

  }

  initializeBarZoom() {

    d3.select('#Barchart-svg')
      .append('rect')
        .classed('zoom', true)
        .attr('id', 'bar-zoom')
        .attr('width', CHART_WIDTH - MARGIN.left - MARGIN.right)
        .attr('height', CHART_HEIGHT - MARGIN.bottom - MARGIN.top)
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  }

  initializeClipPath() {

    d3.select('#Barchart-svg').append('defs')
      .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
          .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
          .attr('width', CHART_WIDTH - MARGIN.left - MARGIN.right)
          .attr('height', CHART_HEIGHT - MARGIN.bottom - MARGIN.top)
          .attr('x', 0)
          .attr('y', 0);

    d3.select('#BarChart')
      .attr('clip-path', 'url(#clip)');

  }

  drawBars() {

    d3.select('#BarChart')
      .selectAll('rect')
      .data(this.data)
      .join(
        enter => enter
          .append('rect')
          .attr('width', 2)
          .attr('x', d => this.xScale(d[0]))
          .attr('y', d => this.yScale(d[1].length) + MARGIN.top)
          .attr('height', d => this.yScale(0) - this.yScale(d[1].length))
          .attr('opacity', 0)
          .attr('id', d => d.start)
          // .transition()    // for whatever reason, causes opacity to get stuck < 1.0
          // .duration(ANIMATION_DURATION)
          // .delay(ANIMATION_DURATION)
          .attr('height', d => this.yScale(0) - this.yScale(d[1].length))
          .attr('opacity', 1),
        update => update
          .attr('x', d => this.xScale(d[0]))
          .transition()
          .duration(ANIMATION_DURATION)
          .attr('width', 2)
          // .attr('x', d => this.xScale(d[0])) // zoom brush move causes bars to lag behind x-axis, though switching bins looks less cool
          .attr('y', d => this.yScale(d[1].length) + MARGIN.top)
          .attr('height', d => this.yScale(0) - this.yScale(d[1].length))
          .attr('id', d => d.start),
        exit => exit
          .transition()
          .duration(ANIMATION_DURATION)
          .attr('width', 0)
          .attr('height', 0)
          .remove()
      )
      .on('mouseover', (e) => d3.select(e.target).classed('hovered', true))
      .on('mouseout', (e) => d3.select(e.target).classed('hovered', false))
      .on('click', (e, d) => {
        globalApplicationState.selectedStartPeak.has(d[0]) ? globalApplicationState.selectedStartPeak.delete(d[0]) : globalApplicationState.selectedStartPeak.add(d[0]);
        let isSelected = globalApplicationState.selectedStartPeak.has(d[0]) ? true : false; // TODO: used?
        d3.select(e.target).classed('hovered', false);
        this.updateSelectedRects();
        globalApplicationState.sequenceTable.drawTable();
      });

    this.updateSelectedRects();

  }

  updateSelectedRects(){

    d3.select('#BarChart')
      .selectAll('rect')
      .classed('selected', (d) => globalApplicationState.selectedStartPeak.has(d[0]) ? true : false);

  }

}
