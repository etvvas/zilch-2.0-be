const { promises } = require('fs');

module.exports = (pool) => {
  return promises.readFile('./sql/setup.sql', { encoding: 'utf-8' })
    .then(sql => pool.query(sql));
};
