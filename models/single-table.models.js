let mongoose = require('mongoose');
let tables = {};
let singleTableModels = {};

singleTableModels.getTables = getTables;
singleTableModels.createSchemaModelFromJson = createSchemaModelFromJson;
singleTableModels.updateSchemaModelFromJson = updateSchemaModelFromJson;
singleTableModels.deleteRecord = deleteRecord;
singleTableModels.truncateTable = truncateTable;

module.exports = singleTableModels;

function getTables() {
    return tables;
}

// Assume all the fields except _id are Strings
function createSchemaModelFromJson(tableName, json, res) {
    let newSchema = {};
    let schemaConfig = {collection: tableName, _id: false, versionKey: false};
    let propertyNames = Object.getOwnPropertyNames(json);
    for (let i = 0; i < propertyNames.length; i ++) {
        if (propertyNames[i] === 'id') {
            newSchema['_id'] = {type: Number, default: null};
        } else {
            newSchema[propertyNames[i]] = {type: String, default: null};
        }
    }

    // if this table exists in the tables
    let schema, model;
    if (tables.hasOwnProperty(tableName)) {
        [schema, model] = tables[tableName];
        updatedSchema = accommodateNewFields(newSchema, schema);
        if (updatedSchema !== {}) {
            model.schema.add(updatedSchema);
            tables[tableName] = [model.schema, model];
        }
    } else {
        schema = new mongoose.Schema(newSchema, schemaConfig);
        model = mongoose.model(tableName + 'Model', schema);
        tables[tableName] = [schema, model];
    }

    model.create(json).then( (returnedValue) => { res.json(returnedValue); }, (err) => { res.send(err); });
}

function updateSchemaModelFromJson(tableName, json, id, res) {
    console.log(json, id);
    let newSchema = {};
    let propertyNames = Object.getOwnPropertyNames(json);
    for (let i = 0; i < propertyNames.length; i ++) {
        if (propertyNames[i] === 'id') {
            newSchema['_id'] = {type: Number, default: null};
        } else {
            newSchema[propertyNames[i]] = {type: String, default: null};
        }
    }

    // if this table exists in the tables
    let schema, model;
    if (tables.hasOwnProperty(tableName)) {
        [schema, model] = tables[tableName];

        // check if id exists
        model.findOne({'_id': id}, (error, record) => {
            console.log(record);
            if (record && !error) {
                updatedSchema = accommodateNewFields(newSchema, schema);
                if (updatedSchema !== {}) {
                    model.schema.add(updatedSchema);
                    tables[tableName] = [model.schema, model];
                }
                model.update({'_id': id}, json, (error, updateStatus) => {
                    if (updateStatus && !error) {
                        model.findOne({'_id': id}, (error, record) => {
                            if (record && !error) {
                                res.json(record);
                            }
                        })
                    } else {
                        res.send(err);
                    }});
            } else {
                res.json(null);
            }
        });
    } else {
        res.json(null);
    }
}

function accommodateNewFields(newSchema, schema) {
    let newPropertyNames = Object.getOwnPropertyNames(newSchema);
    let propertyNames = Object.getOwnPropertyNames(schema);
    let newFields = getNewFields(newPropertyNames, propertyNames);
    let res = {};
    for (let i = 0; i < newFields.length; i ++) {
        res[newFields[i]] = {type: String, default: null};
    }
    return res;
}

function getNewFields(newPropertyNames, propertyNames) {
    let newFields = [];
    for (let i = 0; i < newPropertyNames.length; i ++) {
        if (propertyNames.indexOf(newPropertyNames[i]) < 0) {
            newFields.push(newPropertyNames[i]);
        }
    }
    return newFields;
}

function deleteRecord(tableName, id, res) {
    if (tables.hasOwnProperty(tableName)) {
        [schema, model] = tables[tableName];
        // check if id exists
        model.findOne({'_id': id}, (error, record) => {
            console.log(record);
            if (record && !error) {
                model.deleteOne({'_id': id}, (err, deleteStatus) => {
                    console.log(deleteStatus);
                    if (deleteStatus && !err) {
                        res.json(deleteStatus);
                    } else {
                        res.send(err);
                    }
                });
            } else {
                res.json(null);
            }
        });
    } else {
        res.json(null);
    }
}

function truncateTable(tableName, res) {
    if (tables.hasOwnProperty(tableName)) {
        [schema, model] = tables[tableName];
        model.deleteMany({}).then(() => {
            res.status(200);
        }, (err) => { res.send(err); })
    } else {
        res.json(null);
    }
}