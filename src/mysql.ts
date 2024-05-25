import { DataSource, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import mysql from "mysql";

export const myDataSource = new DataSource({
  type: "mysql",
  host: "rm-bp1t70r50j4f9x1u9vo.mysql.rds.aliyuncs.com",
  port: 3306,
  username: "root",
  password: "Hz072201##jydb",
  database: "pump",
  //   entities: [User],
  entities: ["src/entity/*.ts"],

  synchronize: true,
});

export const config = {
  host: "rm-bp1t70r50j4f9x1u9vo.mysql.rds.aliyuncs.com",
  port: 3306,
  username: "root",
  password: "Hz072201##jydb",
  database: "pump",
};

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "test",
});
