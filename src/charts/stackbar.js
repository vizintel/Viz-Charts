import * as d3 from 'd3';

/**
 * @typedef StackBarData
 * @type {Object[]}
 * @property {String} nameLabel
 * @property {Number} category1		Value of category 1
 * @property {Number} caterogy2		Value of category 2
 * @property {Number} caterogy3		Value of category 3
 * 
 * @example
 * [
 * 		{ YearQtr: 2000Q1, House: 1800, Unit: 1500, Land: 1200 },
 * 		{ YearQtr: 2000Q2, House: 1800, Unit: 1500, Land: 1200 },
 * 		{ YearQtr: 2000Q3, House: 1800, Unit: 1500, Land: 1200 }
 * ]
 */


/**
 * Bar Chart Reusable API component that renders a vertical
 * bar chart
 * 
 * @module StackedBarChart
 * @requires d3
 * @returns exports
 * 
 * @example
 * import stackbar from 'stackbar.js'
 * const stackbarChart = stackbar();
 * 
 * stackbarChart
 * 		.nameLabel('YearQtr')
 * 		.stackLabel('Type')
 * 		.valueLabel('NumSales')
 * 		.margin({left: 60, bottom: 45})
 * 
 * d3.select('.css-selector')
 * 		.datum(dataset)
 * 		call(stackbarChart)
 * 
 */
function chart() {
	// Private attributes
	let margin = { top: 20, right: 20, bottom: 20, left: 20 },
			width = 960,
			height = 500,
			// axisPadding = { top: 0, left: 0, bottom: 0, right: 0 },

			xScMkr,
			yScMkr,
			colorScMkr,

			xAxisMkr,
			yAxisMkr,
			xAxis,
			yAxis,

			svg,
			chartGroup, 
			layersJoin, layersEnter, 
			barsJoin, barsEnter,

			data,
			categories,
			stackMkr,
			transformedData,
			nameLabel = 'name', // name column e.g. x-axis label for vertical bars
			stackLabel = 'stack', // categories column name
			valueLabel = 'value', // numeral column name

			tspeed = 1000,

			dispatcher = d3.dispatch(
				'customMouseOver',
				'customMouseOut',
				'customMouseMove',
				'customClick'
			);


	function exports(_selection) {

		_selection.each(function(_data) {
			data = _data

			buildLayout(data)
			buildSVG(this) // along with container groups
			buildScales()
			buildAxes()
			drawAxes()
			drawStackedBar()
			addMouseEvents()

		});
	}

	// Building blocks
	function buildLayout(data) {
		// categories = new Set(data.map(d => d[stackLabel]))
		categories = Array.from(new Set(data.map(d => Object.keys(d)).flat())).slice(1)

		stackMkr = d3.stack()
			.keys(categories)
			.value((d, key) => d[key] ? d[key] : 0)
			.order(d3.stackOrderNone)
			.offset(d3.stackOffsetNone)

		transformedData = stackMkr(data)
		console.log('transformedData', transformedData)
	}

	function buildSVG(container) {
		if(!svg) {
			svg = d3.select(container)
				.append('svg')
					.classed('vizintel stacked-bar', true)

			buildContainerGroups()
		}
		svg
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
	}

	function buildContainerGroups() {
		let container = svg
			.append('g')
			.classed('container-group', true)
			.attr('transform', `translate(${margin.left}, ${margin.right})`)

		container
			.append('g').classed('x-axis-group', true)
			.append('g').classed('x axis', true)
		container
			.append('g').classed('y-axis-group axis', true)
		container
			.append('g').classed('grid-lines-group', true)
		container
			.append('g').classed('chart-group', true)
	}

	function buildScales() {

		xScMkr = d3.scaleBand()
			.domain(data.map(d => d[nameLabel]))
			.rangeRound([0, width])
			.padding(0.1)

		let maxValue = getMaxValue()
		yScMkr = d3.scaleLinear()
			.domain([0, maxValue])
			.rangeRound([height, 0])
			.nice()

		colorScMkr = d3.scaleOrdinal(d3.schemeSet3) // Try github.com/d3/d3-scale-chromatic
			.domain(categories)
			.unknown('#ccc')

	}

	function buildAxes() {
		xAxisMkr = d3.axisBottom(xScMkr)
		yAxisMkr = d3.axisLeft(yScMkr)
			// .ticks()
	}

	function drawAxes() {
		xAxis = svg.select('.x-axis-group .x.axis')
		xAxis
			.attr('transform', `translate( 0, ${ height })`)
			.transition().duration(tspeed)
			.call(xAxisMkr)
		
		xAxis.selectAll('text')
				// .attr('x', 9)
				// .attr('y', -5)
				.attr('dx', '9')
				.attr('dy', '-6')
				.attr('transform', 'rotate(90)')
				.style('text-anchor', 'start')

		yAxis = svg.select('.y-axis-group.axis')
		yAxis
			.attr('transform', `translate(0, 0)`)
			.transition().duration(tspeed)
			.call(yAxisMkr)
	}

	function drawStackedBar() {
		// Not ideal, we need to figure out how to call exit for nested elements
		if (layersEnter) {
			svg.selectAll('.layer').remove();
		}

		chartGroup = d3.select('.chart-group')

		layersJoin = chartGroup.selectAll('.layer')
			.data(transformedData)
		
		layersJoin.exit().remove()
		
		layersEnter = layersJoin
			.enter().append('g')
				.classed('layer', true)
				
		layersJoin = layersJoin.merge(layersEnter)		
		
		layersJoin
			.attr('fill', d => colorScMkr(d.key))
			.attr('stroke', 'white')

		barsJoin = layersEnter.selectAll('.bar')
			.data(d => d)

		barsJoin.exit().remove()
	
		barsEnter = barsJoin
			.enter().append('g')
				.classed('bar', true)
			.append('rect')

		barsJoin = barsJoin.merge(barsEnter)

		barsJoin
					.attr('x', d => xScMkr(d.data[nameLabel]))
					.attr('y', d => yScMkr(0))
					.attr('width', xScMkr.bandwidth())
					.attr('height', d => yScMkr(d[0]) - yScMkr(0))
					.transition().duration(tspeed)
					.attr('y', d => yScMkr(d[1]))
					.attr('height', d => yScMkr(d[0]) - yScMkr(d[1]))

			

			// group2
			// 	.select('.node_rect')
			// 	.attr('x', d => xScMkr(d.data.key))
			// 	.attr('y', yScMkr(0))
			// 	.attr('width', xScMkr.bandwidth())
			// 	.attr('height', d => yScMkr(d[0]) - yScMkr(0))
			// 	.transition().duration(0)
			// 	.attr('y', d => yScMkr(d[1]))
			// 	.attr('height', d => yScMkr(d[0]) - yScMkr(d[1]))
			
	}

	/**
	 * @todo Complete function implementation
	 */
	function addMouseEvents() {
		svg
			// .on('mouseover', function(d) {
			// 	handleMouseOver(this, d);
			// })
			// .on('mouseout', function(d) {
			// 	handleMouseOut(this, d);
			// })
			// .on('mousemove', function(d) {
			// 	handleMouseMove(this, d);
			// })
			.on('click', function(d) {
				handleClick(this, d);
			})

		svg.selectAll('.bar')
			.on('mouseover', handleBarsMouseOver)
			.on('mouseout', handleBarsMouseOut)

	}

	function handleBarsMouseOver() {
		d3.select(this)
				.attr('fill', () => d3.color(d3.select(this.parentNode).attr('fill')).darker())
	}

	function handleBarsMouseOut() {
		d3.select(this)
			.attr('fill', () => d3.select(this.parentNode).attr('fill'))
	}

	/**
	 * @todo Complete function implementation
	 * @param {event} e 
	 */
	function handleClick(e) {
		// let [mouseX, mouseY] = d3.mouse(e)

		// dispatcher.call('customClick', e)
	}

	// Helper utilities
	function getMaxValue() {
		let array = []
		data.map((e, i) => {
			array[i] = d3.sum(categories.map(k => e[k]))
		})
		return d3.max(array)
	}

	// API
	exports.nameLabel = function(_x) {
    if (!arguments.length) { return nameLabel; }
    nameLabel = _x;
    return this;
  }

	exports.stackLabel = function(_x) {
    if (!arguments.length) { return stackLabel; }
    stackLabel = _x;
    return this;
  }

	exports.valueLabel = function(_x) {
    if (!arguments.length) { return valueLabel; }
    valueLabel = _x;
    return this;
  }

	// exports.axisPadding = function(_x) {
  //   if (!arguments.length) { return axisPadding; }
  //   axisPadding = { ...axisPadding, ..._x };
  //   return this;
  // }

	exports.margin = function(_x) {
    if (!arguments.length) { return margin; }
    margin = { ...margin, ..._x };
    return this;
  }

	exports.on = function() {
		let value = dispatcher.on.apply(dispatcher, arguments);

		return value === dispatcher ? exports : value;
	}


	return exports;
}

export default chart;