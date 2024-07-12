//@ts-check

var database = function (client, req, res) {
  return {
    SELECT: async function () {
      let statement;

      try {
        switch (arguments.length) {
          case 2:
            statement = await (await client.query(`SELECT * FROM ${arguments[0]} WHERE ${arguments[1]}`)).rows;
            break;
          default:
            statement = await (await client.query(`SELECT * FROM ${arguments[0]}`)).rows;
            break;
        }
      } catch (e) {
        throw e.message;
      } finally {
        return statement;
      }
    },

    INSERT: async function () {
      let data;
      let valueIndex = () => {
        return Object.values(req.body).map((item, index) => `$${index + 1}`).join(', ');
      }

      if (arguments.length > 1) {
        try {
          if (arguments[1] === false) {
            console.log(req.body);
            data = await client.query(`INSERT INTO ${arguments[0]} (${Object.keys(req.body).join(", ")}) VALUES (${valueIndex()})`, Object.values(req.body));
            return 200;
          }

          return 302;
        } catch (e) {
          throw e.message;
        }
      }

      try {
        data = await client.query(`INSERT INTO ${arguments[0]} (${Object.keys(req.body).join(", ")}) VALUES (${valueIndex()})`, Object.values(req.body));
        return data;
      } catch (e) {
        throw e.message;
      }
    },

    DELETE: async function () {
      let rowCount = (await client.query(`DELETE FROM ${arguments[0]} WHERE ${arguments[1]} = ${req.params.id}`)).rowCount;

      try {
        return rowCount;
      } catch (e) {
        throw e.message;
      }
    },

    UPDATE: async function () {
      let expressionString = function () {
        let expressions = [];

        for (let key in req.body) {
          expressions.push(`${key} = '${req.body[key]}'`);
        }

        return expressions.join(', ');
      }

      try {
        let update = await (await client.query(`UPDATE ${arguments[0]} SET ${expressionString()} WHERE ${arguments[1]} RETURNING *`)).rows;
        return update;
      } catch (e) {
        throw e.message;
      }
    }
  }
};

/**
 * @param {any} message 
 * @param {number} code 
 */
function Response(message, code) {
  this.message = message;
  this.status = code;
}

module.exports = { database, Response };