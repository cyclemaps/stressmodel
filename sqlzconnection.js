import 'dotenv/config';
import { Sequelize, QueryTypes } from "sequelize";

export default async function sqlize(data, zero, verbose) {
  try {
    if (!process.env.DB_CONNECT_URI) {
      if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME) {
        throw '.env file needs to have a DB_USER, DB_HOST, DB_PORT and DB_NAME value.'
      }
    }
    const uri =  process.env.DB_CONNECT_URI ? process.env.DB_CONNECT_URI : `postgres://${process.env.DB_USER}${process.env.DB_PASS ? ':'+process.env.DB_PASS : ''}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    const sequelize = new Sequelize(uri, {logging: false});
  
    await sequelize.authenticate();
    if (verbose) {
      console.log('Connection has been established successfully.');
    }

    const keys = Object.keys(data);
    for (let i = zero ? 0 : 1; i < keys.length; i++) {
      const query = `UPDATE ways SET stress_level = ${i} WHERE osm_id IN (${JSON.stringify(data[keys[i]]).replace(/[\[\]"]+/g,'')})`
      if (verbose) {
        console.log(`Updating level ${i} ways.`);
      }
      await sequelize.query(query, { type: QueryTypes.UPDATE });
    }

    if (verbose) {
      const nullWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level IS NULL", { type: QueryTypes.SELECT });
      const zeroWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level = 0", { type: QueryTypes.SELECT });
      const oneWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level = 1", { type: QueryTypes.SELECT });
      const twoWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level = 2", { type: QueryTypes.SELECT });
      const threeWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level = 3", { type: QueryTypes.SELECT });
      const fourWaysCount = await sequelize.query("SELECT count(*) FROM ways WHERE stress_level = 4", { type: QueryTypes.SELECT });
      console.log(`Ways levels count:
        Null = ${JSON.stringify(nullWaysCount[0].count)}, 
        0 = ${JSON.stringify(zeroWaysCount[0].count)}, 
        1 = ${JSON.stringify(oneWaysCount[0].count)}, 
        2 = ${JSON.stringify(twoWaysCount[0].count)}, 
        3 = ${JSON.stringify(threeWaysCount[0].count)}, 
        4 = ${JSON.stringify(fourWaysCount[0].count)}`);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}