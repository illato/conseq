
/** Class implementing the Bar plot. */
class Barplot {
  /**
  * Initialize Barplot object and draw corresponding elements
  */
  constructor(binData) {
    this.initializeBarPlot();
    this.drawBarPlot(binData);
  }

  initializeBarPlot(){
    /**
     * Initialize Error Histogram Charts
     */
    this.initializeFocus();
    this.initializeContext();
    this.initializeErrorTypeCharts();
  }

  initializeFocus() {
    /**
     * Initialize Error Histogram Focus
     */
    let focus = d3.select('#Barchart-div')
      .append('svg')
      .attr('id', 'Barchart-svg')
      .attr('height', CHART_HEIGHT + MARGIN.top + MARGIN.main_bottom)
      .attr('width', CHART_WIDTH + MARGIN.left + MARGIN.right);

    this.initializeBarZoom(); // behind bars => bar:hover & zoom both work

    focus.append('g')
      .attr('id', 'Barchart-x-axis')

    focus.append('g')
      .attr('id', 'Barchart-y-axis');

    focus.append('g')
      .attr('id', 'BarChart')
      .attr('class', 'bar-chart');

    let text_hover = focus.append('g')
      .attr('id', 'text-hover');

    text_hover
      .append('text');

    text_hover
      .append('rect');

    text_hover
      .append('line')
      .attr('id', 'text-line-left');

    text_hover
      .append('line')
      .attr('id', 'text-line-right');

    this.initializeClipPath();
    this.addFocusYAxisLabel(focus);
    this.addFocusXAxisLabel(focus);
  }

  addFocusYAxisLabel(focus) {
    /**
     * Add y-axis label to Error Histogram Focus
    */
    focus.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', MARGIN.left / 2)
      .attr('x', -BAR_CONTEXT_HEIGHT / 1.5)
      .text('Error Frequency')
  }

  addFocusXAxisLabel(focus) {
    /**
     * Add x-axis label to Error Histogram Focus
    */
     focus.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', CHART_HEIGHT - MARGIN.bottom / 2) // TODO
      .attr('x', CHART_WIDTH / 2)
      .text('Nucleotide Index')
  }

  initializeContext() {
    /**
     * Initialize Error Histogram Context
     */
    let context = d3.select('#Barchart-div')
      .append('svg')
      .style('height', BAR_CONTEXT_HEIGHT)
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

  initializeErrorTypeCharts() {
    /**
     * Initialize Error-Type Specific Charts
     */
    globalApplicationState.types.forEach( el => {

        d3.select(`#Barchart-div`)
          .append('g')
          .attr('id', `barchart-${el}-title`);


        let barchart = d3.select('#Barchart-div')
          .append('svg')
          .style('height', BAR_CONTEXT_HEIGHT)
          .attr('id', `barchart-svg-${el}`)
          .append('g')
          .attr('id',`barchart-${el}`);

        barchart.append('g')
          .attr('id', `barchart-${el}-x-axis`);

        barchart.append('g')
          .attr('id', `barchart-${el}-bars`)
          .attr('class', 'bar-chart');
    });
  }

  drawBarPlot(binData){
    /**
     * Draw/Re-Draw Error Histogram plots
     */
    this.data = d3.group(binData, d => d.start);

    const maxLength = d3.max([...this.data.values()], n => n.length);

    this.yScale = d3.scaleLinear()
      .domain([0, maxLength])
      .range([CHART_HEIGHT - MARGIN.main_bottom - MARGIN.top, 0])
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
    this.setupTitles();
    this.setupBrush();
    this.setupZoom();
    this.setupHoverSequenceView();

  }

  setupHoverSequenceView(){
    /**
     * Setup listener for sequence peek on hover
     */
    d3.select('#Barchart-svg')
    .on('mousemove', (e) => {
      let x = d3.pointer(e)[0];

      const bpHoverTargetApprox = this.xScale.invert(x);
      const bpHoverTarget = parseInt(Math.round(bpHoverTargetApprox));
      const radius = 7;
      const character_width = 11;
      const line_buffer = 2;

      if (x > MARGIN.left && x < CHART_WIDTH - MARGIN.right && this.xScale.domain()[1] - this.xScale.domain()[0] > radius * 2) {
        // Set the line position
        d3.select('#text-hover')
          .select('rect')
          .attr('stroke', 'none')
          .attr('fill', 'grey')
          .attr('opacity', 0.5)
          .attr('width', Math.abs(this.xScale(bpHoverTargetApprox - radius) - this.xScale(bpHoverTargetApprox + radius)))
          .attr('x', this.xScale(bpHoverTargetApprox - radius))
          .attr('y', CHART_HEIGHT - MARGIN.main_bottom)
          .attr('height', MARGIN.bottom);

        let text_x;
        if (x < CHART_WIDTH - MARGIN.right - radius * character_width && x > MARGIN.left + radius * character_width){text_x = this.xScale(bpHoverTargetApprox)-radius*character_width}
        else if (x > CHART_WIDTH - MARGIN.right - radius * character_width){text_x = CHART_WIDTH - MARGIN.right - radius * character_width * 2}
        else {text_x = MARGIN.left}


        d3.select('#text-hover')
          .select('text')
          .text(globalApplicationState.seq.substring(bpHoverTarget-radius,bpHoverTarget+radius))
          .attr('x', text_x)
          .attr('y', MARGIN.top);

        d3.select('#text-line-left')
          .attr('opacity',0.5)
          .attr('stroke', 'blue')
          .attr('x1', text_x - line_buffer)
          .attr('x2', this.xScale(bpHoverTargetApprox - radius))
          .attr('y1', MARGIN.top)
          .attr('y2', CHART_HEIGHT - MARGIN.main_bottom);

        d3.select('#text-line-right')
          .attr('opacity',0.5)
          .attr('stroke', 'blue')
          .attr('x1', text_x + radius * character_width * 2 + line_buffer)
          .attr('x2', this.xScale(bpHoverTargetApprox + radius))
          .attr('y1', MARGIN.top)
          .attr('y2', CHART_HEIGHT - MARGIN.main_bottom);
      }
    })
    .on('mouseout', (e) => {
      d3.select('#text-hover')
        .select('text')
        .text('');

      d3.select('#text-hover')
        .select('rect')
        .attr('stroke', 'none')
        .attr('fill', 'none');

      d3.select('#text-line-left')
        .attr('stroke', 'none')
        .attr('fill', 'none');

      d3.select('#text-line-right')
        .attr('stroke', 'none')
        .attr('fill', 'none');
    }
  );

  }

  setupZoom() {
    /**
     *  Setup listen for zoom on scroll in Error Histogram Focus
     */
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
    /**
     * Setup brushing in Error Histogram Context
     */
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
    /**
     * Add (zoom-variable) x-axis to Error Histogram Focus
     */
    d3.select('#Barchart-x-axis')
      .classed('barchart-x-axis', true)
      .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.main_bottom})`)
      .call(this.xAxis);

  }

  addContextXAxis() {
    /**
     * Add (zoom-invariant) x-axis to Error Histogram Context(s)
     */
    d3.select('#Barchart-context-x-axis')
      .attr('transform', `translate(0,${BAR_CONTEXT_HEIGHT - MARGIN.bottom})`)
      .call(this.xAxis2);

    globalApplicationState.types.forEach(el =>{
      d3.select(`#barchart-${el}-x-axis`)
        .attr('transform', globalApplicationState.isMultiView ? `translate(0,${BAR_CONTEXT_HEIGHT - MARGIN.bottom})` : 'translate(-100,-100)')
        .call(globalApplicationState.isMultiView ? this.xAxis2 : d3.axisBottom(d3.scaleLinear().domain([0,0]).range([0,0])));
    })

  }

  addYAxis() {
    /**
     * Add y-axis to Error Histogram Focus
     */
    d3.select('#Barchart-y-axis')
      .call(d3.axisLeft(this.yScale))
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  }

  drawMiniBars() {
    /**
     * Draw/Re-Draw mini-bars in Error Histogram Context(s)
     */
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

    globalApplicationState.types.forEach(el =>{

      let tempData = new Map()
      this.data.forEach((v,k) => {
        tempData.set(k, v.filter(s => globalApplicationState.sequenceTable.determineErrorType(s) === el))
      })

      d3.select(`#barchart-${el}-bars`)
        .selectAll('rect')
        .data(tempData)
        .join(
          enter => enter
            .append('rect')
            .attr('width', 2)
            .attr('x', d => MARGIN.left)
            .attr('y', d => this.y2(d[1].length) + MARGIN.top)
            .attr('height', d => 0)
            .attr('id', d => d.start)
            .attr('opacity', 1)
            .classed(el, true),
          update => update
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('y', d => this.y2(d[1].length) + MARGIN.top)
            .attr('x', d => globalApplicationState.isMultiView ? this.x2(d[0]) : MARGIN.left)
            .attr('height', d => globalApplicationState.isMultiView ? this.y2(0) - this.y2(d[1].length) : 0),

          exit => exit
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('width', 0)
            .attr('height', 0)
            .remove()
        )

    });
  }

  setupTitles() {
    /**
     * Setup and add/remove text in titles on Error-Type Specific Histograms
     */
    globalApplicationState.types.forEach(el =>{
      d3.select(`#barchart-${el}-title`)
        .selectAll('h3')
        .data([globalApplicationState.isMultiView])
        .join(
          enter => enter
            .append('h3')
            .text('')
            .attr('class',el)
            .attr('font-weight',100),
          update => update
            .transition()
            .duration(ANIMATION_DURATION)
            .text(d =>  d ? el + 's' : ''),
          exit => exit
            .transition()
            .duration(ANIMATION_DURATION)
            .remove()
        )
      })
  }

  initializeBarZoom() {
    /**
     * Initialize zoom-context shading on Error Histogram Context
     */
    d3.select('#Barchart-svg')
      .append('rect')
        .classed('zoom', true)
        .attr('id', 'bar-zoom')
        .attr('width', CHART_WIDTH - MARGIN.left - MARGIN.right)
        .attr('height', CHART_HEIGHT - MARGIN.main_bottom - MARGIN.top)
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  }

  initializeClipPath() {
    /**
     * Initialize clip path around Error Histogram Focus to prevent overflow on zoom
     */
    d3.select('#Barchart-svg').append('defs')
      .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
          .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
          .attr('width', CHART_WIDTH - MARGIN.left - MARGIN.right)
          .attr('height', CHART_HEIGHT - MARGIN.main_bottom - MARGIN.top)
          .attr('x', 0)
          .attr('y', 0);

    d3.select('#BarChart')
      .attr('clip-path', 'url(#clip)');

  }

  drawBars() {
    /**
     * Draw/Re-Draw Bars for Error Histogram Focus
     */
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
        d3.select(e.target).classed('hovered', false);
        this.updateSelectedRects();
        globalApplicationState.sequenceTable.drawTable();
      });

    this.updateSelectedRects();

  }

  updateSelectedRects(){
    /**
     * Update selected attribute of any selected/deselected Error Histogram Focus bars
     */
    d3.select('#BarChart')
      .selectAll('rect')
      .classed('selected', (d) => globalApplicationState.selectedStartPeak.has(d[0]) ? true : false);
  }

}
