import { Sequelize } from "sequelize-typescript"
import path from "path"

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  database: 'development',
  storage: ':memory:',
  models: [path.join(__dirname, '/models')]
})