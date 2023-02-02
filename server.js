var express = require("express");

var morgan = require("morgan");
var path = require("path");
var bodyParser = require("body-parser");

let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");
//URL-Encoding of User and PWD
//for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

var cors = require("cors");
var app = express();

app.set("json spaces", 3);
app.use(morgan("short"));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/", function (req, res, next) {
  res.send("choose collection e.g /collections/products");
});

app.get("/collections/:collectionName", function (req, res, next) {
  req.collection.find({}).toArray(function (err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});
app.get("/collections/:collectionName", async (req, res, next) => {
  try {
    const searchText = req.query.search;
    let query = {};

    if (searchText) {
      query = {
        $or: [
          { topic: { $regex: searchText, $options: "i" } },
          { location: { $regex: searchText, $options: "i" } },
        ],
      };
    }
    items = req.collection.find(query).toArray();
    res.send(items);
  } catch (err) {
    next(err);
  }
});
// app.get("/lessons", async (req, res, next) => {
//   try {
//     const searchText = req.query.search;
//     let query = {};

//     if (searchText) {
//       query = {
//         $or: [
//           { topic: { $regex: searchText, $options: "i" } },
//           { location: { $regex: searchText, $options: "i" } },
//         ],
//       };
//     }

//     const db = getDb();
//     const collection = db.collection("lesson");
//     const items = await collection.find(query).toArray();

//     res.send(items);
//   } catch (err) {
//     next(err);
//   }
// });
// app.put("/collections/:collectionName/:id", function (req, res, next) {
//   const space = req.body.space;
//   req.collection.findOneAndUpdate(
//     { _id: new ObjectId(req.params._id) },
//     { $inc: { space: -space } },
//     function (err, results) {
//       if (err) {
//         return next(err);
//       }
//       res.send(results);
//     }
//   );
// });
// app.get("/collections/:collectionName", async (req, res, next) => {
//   req.collection.find({}).toArray(function (err, results) {
//     const searchText = req.query.search;
//     // let query = {};
//     const se
//     if (searchText) {
//         $or: [
//           { topic: { $regex: searchText, $options: "i" } },
//           { location: { $regex: searchText, $options: "i" } },
//         ],
//     }
//     res.send(searchText);
//   });
// });
app.post("/collections/:collectionName", function (req, res, next) {
  xyz = req.body;
  // req.body.id = new ObjectId();
  req.collection.insertOne(xyz, function (err, results) {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
});
// const updateLessons = (lessonId, space) => {

// }
// const updateLesson = (lessonId, space) => {
//   req.collection.findOneAndUpdate(
//     { _id: ObjectId(lessonId) },
//     { $inc: { space: -space } },
//     (err, result) => {
//       if (err) throw err;
//     }
//   );
// };
// app.put("/collections/:collectionName/:id", (req, res) => {
//   const lessonId = req.params.id;
//   const space = req.body.space;
//   const updateLesson = (space) => {
//     req.collection.findOneAndUpdate(
//       { _id: new ObjectId(req.params.id) },
//       { $inc: { space: -space } },
//       (err, result) => {
//         if (err) throw err;
//       }
//     );
//   };

//   updateLesson(space);
//   console.log(lessonId);
//   res.send("Lesson updated successfully");
// });

app.put("/collections/:collectionName/:id", function (req, res, next) {
  const lessonId = req.params.id;
  const space = req.body.space;
  const updateLesson = (lessonId, space) => {
    req.collection.findOneAndUpdate(
      { _id: new ObjectId(lessonId) },
      { $set: { space: -space } },
      (err, result) => {
        if (err) throw err;
      }
    );
  };
  updateLesson(lessonId, space);

  res.send("Lesson updated successfully");
});

// Logger middleware
app.use(function (req, res, next) {
  console.log("Request URL:" + req.url);
  console.log("Request Date:" + new Date());
  next();
});
// Static file middleware
var staticPath = path.join(__dirname, "images");
app.use("/images", express.static(staticPath));

app.use(function (req, res) {
  res.status(404);
  res.send("File not found!");
});

app.listen(3000, () => console.log("Server listening on port 3000"));
