import { TextDataType } from 'sequelize'
import { Table, Model, Column, CreatedAt, DataType } from 'sequelize-typescript'

@Table
export class Snapshot extends Model {
  @Column
  symbol!: string

  @Column({ type: DataType.TEXT })
  dataset!: TextDataType

  @CreatedAt
  @Column
  createdAt!: Date
}