import csvtojson from 'csvtojson'
import path from 'path'

const csvPath = path.join(__dirname, '/../../stocks/', 'WIKI_PRICES.csv')
console.log(csvPath)

export interface StockCSV {
  ticker: string
}

export const getStockList = new Promise<StockCSV[]>((resolve, _reject) => {
  csvtojson().fromFile(csvPath)
    .then(jsonObj => { return resolve(jsonObj) })
})
