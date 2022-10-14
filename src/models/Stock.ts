import { Column, CreatedAt, Table, Model } from "sequelize-typescript";

@Table
export class Stock extends Model {
  @Column
  symbol!: string

  @CreatedAt
  @Column
  createdAt!: Date
}