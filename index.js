import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "123456",
  port: 5432,
});
db.connect();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function visitedCountriesList() {
  let result = await db.query("SELECT country_code FROM visited_countries");
  let countries = []; // INSERT country_code
  console.log(result.rows);

  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

//get home
app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await visitedCountriesList();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

// POST requet
app.post("/add", async (req, res) => {
  const countryVisited = req.body.country.trim(); // country added by client

  try {
    let result1 = await db.query("SELECT country_code FROM countries WHERE LOWER (country_name) LIKE '%' || ($1) || '%' ", [
      countryVisited,
    ]);
    const dbCountries = result1.rows; // selected countries and country_code
    console.log(dbCountries);
    const f_CountryCode = dbCountries[0].country_code; // first country_code from array

    try {
      if (dbCountries.length > 0) {
        await db.query("INSERT INTO visited_countries ( country_code ) VALUES ( $1 )", [
          f_CountryCode,
        ]);
      }
      // retrieve updated list of visited country
      let countries = await visitedCountriesList();
      res.render("index.ejs", { countries: countries, total: countries.length });
    } catch (error) {
      // retrieve updated list of visited country
      const countries = await visitedCountriesList();

      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has been already added, try again.",
      });
    }
  } catch (error) {
    // retrieve updated list of visited country
    const countries = await visitedCountriesList();

    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country doesnot exist, try again.",
    });
  }
});
// const countryFound  = dbCountries.find(country => country.country_name === countryVisited);

/* if ( countryFound ){
     const countryFoundcode = countryFound.country_code;
     console.log( countryFoundcode ); // code extract from countryFound
     }
*/

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
