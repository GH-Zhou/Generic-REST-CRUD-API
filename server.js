require('./db')();
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


/**
 * Single Table Operations
 */
const singleTableModels = require('./models/single-table.models');


app.post('/api/:table', insertTable);
app.get('/api/:table', getTable);
// app.get('/api/:table?', getFilteredTable);
app.get('/api/:table/:id', getTableRecord);
app.put('/api/:table/:id', updateRecord);
app.delete('/api/:table/:id', removeRecord);
app.delete('/api/:table', removeTable);


// POST /api/{table}
function insertTable(req, res) {
    let json = req.body;
    let tableName = req.params.table;
    singleTableModels.createSchemaModelFromJson(tableName, json, res);
}

// GET /api/{table}
function getTable(req, res) {
    let tableName = req.params.table;
    let tables = singleTableModels.getTables();
    if (!tables.hasOwnProperty(tableName)) {
        res.json(null);
    } else {
        let model = tables[tableName][1]; // model
        model.find({}).then((records) => {
            res.json(records);
        }, (err) => { res.send(err); });
    }
}

// GET /api/{table}?{predicates}
// function getFilteredTable(req, res) {
//     let tableName = req.params.table;
//     let query = req.query;
//     console.log(query);
//     res.json(null);
// }

// GET /api/{table}/{id}
function getTableRecord(req, res) {
    let tableName = req.params.table;
    let id = req.params.id;
    let tables = singleTableModels.getTables();
    if (!tables.hasOwnProperty(tableName)) {
        res.json(null);
    } else {
        let model = tables[tableName][1]; // model
        model.findById(id).then((record) => {
            res.json(record);
        }, (err) => { res.send(err); })
    }
}

// PUT /api/{table}/{id}
function updateRecord(req, res) {
    let updateBody = req.body;
    let id = req.params.id;
    let tableName = req.params.table;
    singleTableModels.updateSchemaModelFromJson(tableName, updateBody, id, res);
}

// DELETE /api/{table}/{id}
function removeRecord(req, res) {
    let tableName = req.params.table;
    let id = req.params.id;
    singleTableModels.deleteRecord(tableName, id, res);
}


// DELETE /api/{table}
function removeTable(req, res) {
    let tableName = req.params.table;
    singleTableModels.truncateTable(tableName, res);
}

/**
 * Two Table Operations
 */

const twoTableModels = require('./models/two-table.models');

app.post('/api/:table1/:id1/:table2/:id2', addMapping);
app.get('/api/:table1/:id/:table2', retriveRecordsForOneTable);
// app.get('/api/:table/:id/:table2', retrieveFilteredRecordsForOneTable);
app.delete('/api/:table1/:id1/:table2/:id2', deleteMapping);
app.delete('/api/:table1/:id1/:table2', deleteAllMappings);

// POST /api/{table1}/{id1}/{table2}/{id2}
function addMapping(req, res) {
    let tableName1 = req.params.table1;
    let tableName2 = req.params.table2;
    let id1 = req.params.id1;
    let id2 = req.params.id2;
    twoTableModels.createUpdateMapping(tableName1, tableName2, id1, id2, res)
}

// GET /api/{table1}/{id}/{table2}
function retriveRecordsForOneTable(req, res) {
    let tableName1 = req.params.table1;
    let tableName2 = req.params.table2;
    let table1_id = req.params.id;
    twoTableModels.getRecordsForOneTable(tableName1, tableName2, table1_id, res);
}

// GET /api/{table1}/{id}/{table2}?{predicates}


// DELETE /api/{table1}/{id1}/{table2}/{id2}
function deleteMapping(req, res) {
    let tableName1 = req.params.table1;
    let tableName2 = req.params.table2;
    let id1 = req.params.id1;
    let id2 = req.params.id2;
    twoTableModels.removeMapping(tableName1, tableName2, id1, id2, res);
}


// DELETE /api/{table1}/{id1}/{table2}
function deleteAllMappings(req, res) {
    let tableName1 = req.params.table1;
    let tableName2 = req.params.table2;
    let table1_id = req.params.id1;
    twoTableModels.removeAllMappings(tableName1, tableName2, table1_id, res);
}


let port = process.env.PORT || 3000;
app.listen(port);