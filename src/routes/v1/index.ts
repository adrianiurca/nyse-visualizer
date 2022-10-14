import { Router } from "express"
import stocksRouter from "./stocks.routes"

const v1Routes = Router()

v1Routes.use('/stocks', stocksRouter)

export default v1Routes