import axios from "axios"

class Quandl {
  private dataset: any
  constructor(dataset: any) {
    if(typeof dataset === 'undefined') {
      throw new Error('Cannot be called directly')
    } else {
      this.dataset = dataset
    }
  }

  static async build(stock: string): Promise<Quandl> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = (await axios.get(`https://data.nasdaq.com/api/v3/datasets/WIKI/${stock}.json?&column_index=4&order=asc&api_key=${process.env.API_KEY}`)).data.dataset
        return resolve(new Quandl(data))
      } catch (reason) {
        return reject(reason)
      }
    })
  }

//   getStock(): string { return this.stock }
//   buildURL(): string { return `https://data.nasdaq.com/api/v3/datasets/WIKI/${this.stock}.json?api_key=${this.apiKey}` }
  getDataset(): any {
    return this.dataset
  }
}

export default Quandl