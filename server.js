require('./db')();
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const singleTableModels = require('./models/single-table.models');

app.post('/api/:table', insertTable);
app.get('/api/:table', getTable);
// app.get('/api/:table?', getFilteredTable);
app.get('/api/:table/:id', getTableRecord);
app.put('/api/:table/:id', updateRecord);
app.delete('/api/:table/:id', removeRecord);
app.delete('/api/:table', removeTable);

// POST  /api/{table}
function insertTable(req, res) {
    let json = req.body;
    let tableName = req.params.table;
    let Model = singleTableModels.createSchemaModelFromJson(tableName, json);
    Model.create(json).then( (returnedValue) => { res.json(returnedValue); }, (err) => { res.send(err); });
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

app.listen(3000);