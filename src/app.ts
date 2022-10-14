import express from "express"
import dotenv from "dotenv"
import { StockCSV, getStockList } from "./lib/stock_list_json"
import routes from "./routes"
import path from 'path'
import { sequelize } from './sequelize'
import { Stock } from './models/Stock'

(async() => {
  await sequelize.sync({ force: true })

  dotenv.config()
  const port = process.env.PORT || 3000
  const app = express()

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.use('/static', express.static(path.join(__dirname, 'public')))
  app.use(express.json())
  app.use(routes)

  const stocksFromDB = await Stock.findAll()
  if(stocksFromDB.length === 0) {
    const stocks: StockCSV[] = await getStockList
    const convertedStocks: Partial<Stock>[] = stocks.map(stock => {
      const returnStock: Partial<Stock> = {
        symbol: stock.ticker
      }
      return returnStock
    })
    await Stock.bulkCreate(convertedStocks)
  }

  app.get('/', async (_req, res) => {
    res.render('index', {
      baseURL: `http://localhost:${port}`
    })
  })

  const server = app.listen(port, () => console.log(`server started at http://localhost:${port}`))

  process.on('SIGTERM', () => server.close())
  process.on('uncaughtException', () => server.close())
})()
