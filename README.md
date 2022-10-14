# nyse-visualizer

This app request data from time-series from quandl for a selected company and store in sqlite database the response to avoid multiple calls for same data.
I use plain ES6 javascript for frontend and express/sequelize for backend.
I used also trading-signals npm package for EMA calculations csvtojson to parse CSV NYSE listed companies.

### run this app

```shell
$: git clone https://github.com/adrianiurca/nyse-visualizer.git
$: npm install
$: npm run start
```

### Time spent breakdown

To develop this project I spent around 8 hours.
First I played with quandl, reading the docs and after I created a PoC(an nodejs script that request quandl time-series and generate an HTML file). Based on this PoC I developed an express API and frontend.

### next things to do

I think also to implement tests using mocha

### qudos

Thanks for this opportunity. I learned a lot from this project, such as finacial stocks are part of complex industry and software development has a lot to offer to it.