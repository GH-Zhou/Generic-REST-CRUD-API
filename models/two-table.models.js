let mongoose = require('mongoose');
let singleTableModels = require('./single-table.models');
let twoTableModels = {};

let tables = singleTableModels.getTables();

twoTableModels.createUpdateMapping = createUpdateMapping;
twoTableModels.getRecordsForOneTable = getRecordsForOneTable;
twoTableModels.removeMapping = removeMapping;
twoTableModels.removeAllMappings = removeAllMappings;

module.exports = twoTableModels;

function createUpdateMapping(tableName1, tableName2, id1, id2, res) {
    if (!tables.hasOwnProperty(tableName1) || !tables.hasOwnProperty(tableName2)) {
        res.json(null);
        return;
    }

    let tableNames = [tableName1, tableName2];
    tableNames.sort(); // alphabetical order
    let relationName = tableNames[0] + '_' + tableNames[1];

    let model;
    if (tables.hasOwnProperty(relationName)) {
        [schema, model] = tables[relationName];
    } else {
        let schema = {};
        schema[tableName1] = Number;
        schema[tableName2] = Number;
        let schemaConfig = {collection: relationName, versionKey: false};
        let relationSchema = new mongoose.Schema(schema, schemaConfig);
        model = mongoose.model(relationName, relationSchema);
        tables[relationName] = [schema, model];
    }
    // swap id if tableNames[0] is not originally tableName1
    if (tableNames[0] !== tableName1) {
        [id1, id2] = [id2, id1];
    }

    let newRecord = {};
    newRecord[tableNames[0]] = id1;
    newRecord[tableNames[1]] = id2;
    model.create(newRecord).then( (obj) => {
        let returnObj = {};
        returnObj[tableNames[0]] = obj[tableNames[0]];
        returnObj[tableNames[1]] = obj[tableNames[1]];
        res.json(returnObj);
    }, (err) => { res.send(err); });

}

function getRecordsForOneTable(tableName1, tableName2, table1_id, res) {
    if (!tables.hasOwnProperty(tableName1) || !tables.hasOwnProperty(tableName2)) {
        res.json([]);
        return;
    }

    [schema1, model1] = tables[tableName1];
    [schema2, model2] = tables[tableName2];

    let tableNames = [tableName1, tableName2];
    tableNames.sort(); // alphabetical order
    let relationName = tableNames[0] + '_' + tableNames[1];
    let relationModel = tables[relationName][1]; // model

    // check if table1_id exists
    model1.findOne({'_id': table1_id}, (error1, record) => {
        if (record && !error1) {
            let query = {};
            query[tableName1] = table1_id;

            // find a list of ids from relationTable
            relationModel.find(query, (error2, records) => {
                if (records && !error2) {

                    // record all the table2_ids
                    let table2_ids = [];
                    for (let i = 0; i < records.length; i ++) {
                        table2_ids.push(records[i][tableName2]);
                    }

                    // return the table2 objects as json array
                    model2.find({'_id': { $in: table2_ids}}, (error3, table2_records) => {
                        if (table2_records && !error3) {
                            res.json(table2_records);
                        } else {
                            res.json([]);
                        }
                    });
                } else {
                    res.json([]);
                }
            })
        } else {
            res.json([]);
        }
    });
}

function removeMapping(tableName1, tableName2, id1, id2, res) {
    if (!tables.hasOwnProperty(tableName1) || !tables.hasOwnProperty(tableName2)) {
        res.json(null);
        return;
    }

    let tableNames = [tableName1, tableName2];
    tableNames.sort(); // alphabetical order
    let relationName = tableNames[0] + '_' + tableNames[1];
    let relationModel = tables[relationName][1]; // model

    // swap id if tableNames[0] is not originally tableName1
    if (tableNames[0] !== tableName1) {
        [id1, id2] = [id2, id1];
    }

    let relationToBeDeleted = {};
    relationToBeDeleted[tableNames[0]] = id1;
    relationToBeDeleted[tableNames[1]] = id2;
    relationModel.deleteOne(relationToBeDeleted, (error) => {
        if (!error) {
            res.json({message: "Relation removed!"});
        } else {
            res.send(error);
        }
    })
}

function removeAllMappings(tableName1, tableName2, table1_id, res) {
    if (!tables.hasOwnProperty(tableName1) || !tables.hasOwnProperty(tableName2)) {
        res.json(null);
        return;
    }

    let tableNames = [tableName1, tableName2];
    tableNames.sort(); // alphabetical order
    let relationName = tableNames[0] + '_' + tableNames[1];
    let relationModel = tables[relationName][1]; // model

    let query = {};
    query[tableNames[0]] = table1_id;
    console.log(query);
    relationModel.deleteMany(query, (error) => {
        if (!error) {
            res.json({ message: "Relations removed!"});
        } else {
            res.send(error);
        }
    });

}