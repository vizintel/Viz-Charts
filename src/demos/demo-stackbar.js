import * as d3 from 'd3'

import stackbar from '../charts/stackbar.js'

randomInt = () => Math.random() * 1000

const data = [
  { YearQtr: '2000Q1', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2000Q2', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2000Q3', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2000Q4', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2001Q1', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2001Q2', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2001Q3', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2001Q4', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2002Q1', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
  { YearQtr: '2002Q2', House: randomInt(100,900), Unit: randomInt(100,900), Land: randomInt(100,900) },
]

const container = d3.select('.container')
const stackbarChart = stackbar()

stackbarChart
  .nameLabel('YearQtr')
	.margin({left: 60, bottom: 45})

container.datum(data).call(stackbarChart)
