var express = require("express");
var router = express.Router();

var movies = [
  { id: 101, name: "Fight Club", year: 1999, rating: 8.1 },
  { id: 102, name: "Inception", year: 2010, rating: 8.7 },
  { id: 103, name: "The Dark Knight", year: 2008, rating: 9 },
  { id: 104, name: "12 Angry Men", year: 1957, rating: 8.9 },
];
const newMovie = ({ data, newID, res }) => {
  movies.push({
    id: newID,
    ...data,
  });
  res.json({ message: "New Movie created", location: `/movies/${newID}` });
};
const editMovie = ({ data, id, res }) => {
  const movie = movies.filter((item) => item.id == id);
  movies.pop(movie);
  console.log(data);
  movies.push({
    id,
    ...data,
  });
  res.json({ message: `Movie id ${id} Updated`, location: `/movies/${id}` });
};

const deleteMovie = ({ id, res }) => {
  const movie = movies.filter((item) => item.id == id);
  movies.pop(movie);
  res.json({ message: `Movie id ${id} Deleted`, location: `/movies/${id}` });
};

router.get("/", (req, res) => {
  res.json(movies);
});

router.get("/:id([0-9]{3,})", (req, res) => {
  let result = movies.filter((item) => item.id == req.params.id);
  result.length > 0 ? res.json(result) : res.status(404);
  res.json({ message: "Notfound" });
});

router.post("/", (req, res) => {
  const newID = movies[movies.length - 1].id + 1;
  const data = {
    name: req.body.name,
    year: req.body.year,
    rating: req.body.rating,
  };
  data.name &&
  data.year.toString().match(/^[0-9]{4}/g) &&
  data.rating.toString().match(/^([0-9]|10)(.[0-9])?$/g)
    ? newMovie({ data, newID, res })
    : res.status(400).json({ message: "bad request" });
});

router.put("/:id([0-9]{3,})", (req, res) => {
  const data = {
    name: req.body.name,
    year: req.body.year,
    rating: req.body.rating,
  };
  let result = movies.filter((item) => item.id == req.params.id);
  result.length > 0
    ? editMovie({ data, id: +req.params.id, res })
    : newMovie({ data, newID: +req.params.id, res });
});

router.delete("/:id([0-9]{3,})", (req, res) => {
  let result = movies.filter((item) => item.id == req.params.id);
  result.length > 0
    ? deleteMovie({ id: +req.params.id, res })
    : res.json({ message: "Not found" });
});
//Routes will go here
module.exports = router;
