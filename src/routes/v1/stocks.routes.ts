import { Router } from "express"
import { Snapshot } from "../../models/Snapshot"
import { Stock } from "../../models/Stock"
import Quandl from "../../lib/quandl"
import { EMA } from 'trading-signals'
import moment from "moment"

const stocksRouter = Router()

stocksRouter.get('/', async(_req, res) => {
  const stocks = await Stock.findAll()
  res.status(200).json(stocks)
})

const fetchOrInsertSnapshot = (symbol: string) => {
  return new Promise<Snapshot>(async(resolve, reject) => {
    const foundSymbol = await Stock.findOne({ where: { symbol: symbol.toUpperCase() } })
    if(foundSymbol) {
      const snapshot = await Snapshot.findOne({ where: { symbol: foundSymbol.symbol }})
      if(snapshot) {
        return resolve(snapshot)
      } else {
        const quandl = await Quandl.build(foundSymbol.symbol)
        const dataset = JSON.stringify(quandl.getDataset())
        const newSnapshot = await Snapshot.create({
          symbol: foundSymbol.symbol,
          dataset
        })
        return resolve(newSnapshot)
      }
    } else {
      return reject({ message: `Symbol '${symbol}' not found!`})
    }
  })
}

stocksRouter.get('/:symbol', async(req, res) => {
  fetchOrInsertSnapshot(req.params.symbol)
    .then(result => res.status(200).json(JSON.parse(result.dataset.toString({ encoding: 'utf8' }))))
    .catch(reason => res.status(404).json(reason))
})

stocksRouter.get('/:symbol/:start', (req, res) => {
  if(req.params.start === 'prediction') {
    fetchOrInsertSnapshot(req.params.symbol)
      .then(snapshot => {
        const dataset = JSON.parse(snapshot.dataset.toString({ encoding: 'utf8' }))
        const startDate = moment(dataset.newest_available_date).add(1, 'days')
        const prices = dataset.data.slice(dataset.data.length - 30, dataset.data.length).map((x: [string, number]) => x[1])
        const ema = new EMA(10)
        for(let i = 0; i < 10; i++) {
          ema.update(prices[i])
        }
        const predictions: [string, number][] = []
        let dateIndex = 1
        prices.slice(10, prices.length).forEach((price: number) => {
          ema.update(price)
          const newPrice: number = parseFloat(ema.getResult().toFixed(2))
          const currentDay = moment(startDate).add(dateIndex, 'days').format('YYYY-MM-DD')
          if(moment(currentDay).weekday() === 1 || moment(currentDay).weekday() === 6) {
            const skipWeekend: number = moment(currentDay).weekday() === 1 ? 1 : 2
            const prediction: [string, number] = [moment(currentDay).add(skipWeekend, 'days').format('YYYY-MM-DD'), newPrice]
            predictions.push(prediction)
            dateIndex += skipWeekend
          } else {
            const prediction: [string, number] = [currentDay, newPrice]
            predictions.push(prediction)
          }
          dateIndex += 1
        });
        res.status(200).json({
          data: predictions,
          column_names: dataset.column_names,
          name: dataset.name
        })
      })
      .catch(reason => res.status(404).json(reason))
  } else {
    res.status(400).json({ message: 'end_date is missing!'})
  }
})

stocksRouter.get('/:symbol/:start/:end', async(req, res) => {
  const startDate = (req.params.start) ? req.params.start : null
  const endDate = (req.params.end) ? req.params.end : null
  if(startDate && endDate) {
    if(moment(startDate).isAfter(endDate)) {
      return res.status(400).json({ message: 'start_date is after end_date!'})
    }
    fetchOrInsertSnapshot(req.params.symbol)
      .then(snapshot => {
        const dataset = JSON.parse(snapshot.dataset.toString({ encoding: 'utf8' }))
        const newestAvailableDate = dataset.newest_available_date
        const oldestAvailableDate = dataset.oldest_available_date
        if(moment(startDate).isBefore(oldestAvailableDate) || moment(startDate).isAfter(newestAvailableDate)) {
          return res.status(400).json({ message: 'start_date is out of range' })
        }
        if(moment(endDate).isBefore(oldestAvailableDate) || moment(endDate).isAfter(newestAvailableDate)) {
          return res.status(400).json({ message: 'end_date is out of range' })
        }
        const slicedData = dataset.data.filter((arr: (string | number)[]) => moment(arr[0]).isSameOrAfter(startDate) && moment(arr[0]).isSameOrBefore(endDate))
        const shrinkedDataset = { ...dataset, data: slicedData }
        return res.status(200).json(shrinkedDataset)
      })
      .catch(reason => res.status(404).json(reason))
  } else {
    res.status(400).json({ message: 'Missing params(startDate or endDate, or both)!'})
  }
})

export default stocksRouter