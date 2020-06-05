const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let database;
let dbClient;

/**
 * Connecting to the MongoDB client and returning a callback so the application can 
 * be started after connection to database has been made.
 * @param {Callback} callback 
 */
const mongoConnect = (url, callback) => {
  MongoClient.connect(url, { useNewUrlParser: true })
    .then(client => {
      dbClient = client;
      database = client.db();
      callback(database);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

/**
 * Used to close the connection to the database.
 */
const mongoDisconnect = callback => {
  dbClient.close().then(() => {
    callback();
  }).catch(err => {
    console.log(err);
  });
}


/**
 * Returns the object database.
 */
const getDatabase = () => {
  if (database) {
    return database;
  }
  throw 'No database found!';
};


/**
 * Takes the name of the collection as input, retrieves that 
 * collection from database and returns it as a lists of objects.
 * @param {String} name
 */
const getCollection = (name) => {
  return database.collection(name).find().toArray()
    .then(myCollection => {
      return myCollection;
    }).catch(err => {
      console.log(err);
    });
}

/**
 * Takes an object and add this object to the provided 
 * collection name in the database. If the collection does not exist, it creates
 * a new collection with that name. 
 * @param {Object} object 
 * @param {String} collection 
 */
const insertDocument = (object, collection) => {
  return database.collection(collection).insertOne(object);
}

/**
 * Returns a single object from the data
 * in the provided path and with provided id.
 * @param {String} objectId 
 * @param {String} path 
 */
const getDocumentById = (objectId, path) => {
  return database.collection(path).find({ _id: new mongodb.ObjectId(objectId) }).next()
    .then(myDocument => {
      return myDocument;
    }).catch(err => {
      console.log(err);
    });
}

/**
 * Returns a single object from the data
 * in the provided path and with provided custom id object.
 * @param {Object} objectId 
 * @param {String} path 
 */
const getDocumentByCustomId = (objectId, path) => {
  return database.collection(path).find(objectId).next()
    .then(myDocument => {
      return myDocument;
    }).catch(err => {
      console.log(err);
    });
}

/**
 * Deletes the object from database with provided
 * id and path.
 * @param {String} objectId 
 * @param {String} path 
 */
const deleteDocumentById = (objectId, path) => {
  return database.collection(path).deleteOne({ _id: new mongodb.ObjectId(objectId) })
    .then(r => {
      return r
    }).catch(err => {
      console.log(err);
    })
}

/**
 * Updates the object in the database with provided 
 * updates for the object.
 * @param {String} objectId 
 * @param {String} path 
 * @param {Object} update 
 */
const updateDocumentById = (objectId, path, update) => {
  return database.collection(path).updateOne({ _id: new mongodb.ObjectId(objectId) }, { $set: update })
    .then(r => {
      return r
    }).catch(err => {
      console.log(err);
    });
}


exports.mongoConnect = mongoConnect;
exports.getDatabase = getDatabase;
exports.mongoDisconnect =mongoDisconnect

exports.getCollection = getCollection;
exports.insertDocument = insertDocument;
exports.getDocumentById = getDocumentById;
exports.getDocumentByCustomId = getDocumentByCustomId;
exports.deleteDocumentById = deleteDocumentById;
exports.updateDocumentById = updateDocumentById;