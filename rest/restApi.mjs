import fs from "fs";
import express from "express";
import http from "http";
import https from "https";

import bodyParser from "body-parser";
import logger from "morgan";
import cors from "cors";
import path from "path";
import {tagUtil} from "../src/js/util/tagUtil.mjs";
import NodeCouchDb from "node-couchdb";

var isProd = process.argv.length > 2 && process.argv[2] === 'prod';
let couchDb = new NodeCouchDb({
    host: 'localhost',
    protocol: 'http',
    port: 5984,
    auth: {
        user: 'accessibility-info-tree-user-readonly',
        pass: 'plaintext_password'
    }
});
var app = express();

var credentials = null;
if (isProd) {
    let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    app.use(logger('combined', {
        stream: accessLogStream,
        skip: (req, res) => req.url.indexOf('/validate-username/') > -1
    }));
    let privateKey = fs.readFileSync('/opt/couchdb/ssl/asterics-foundation.org_private_key.key', 'utf8');
    let certificate = fs.readFileSync('/opt/couchdb/ssl/asterics-foundation.org_ssl_certificate_combined.cer', 'utf8'); //combined certificate, normal and intermediate both in concatenated in one file
    credentials = {key: privateKey, cert: certificate};
} else {
    app.use(logger('dev'));
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.contentType('application/json');
    next();
});

app.get('/tags', function (req, res) {
    getTags(res).then(tags => {
        res.send(tagsToRes(tags));
    })
});

app.get('/tag/:id', function (req, res) {
    getTags(res).then(tags => {
        res.send(tagsToRes(tagUtil.getTag(req.params.id, tags), true));
    })
});

app.get('/tag/:id/children/:maxdepth?', function (req, res) {
    getTags(res).then(tags => {
        res.send(tagsToRes(tagUtil.getAllChildren(req.params.id, tags, req.params.maxdepth)));
    })
});

app.get('/tag/:id/selfandchildren/:maxdepth?', function (req, res) {
    getTags(res).then(tags => {
        let tag = tagUtil.getTag(req.params.id, tags);
        let list = [tag].concat(tagUtil.getAllChildren(req.params.id, tags, req.params.maxdepth));
        res.send(tagsToRes(list));
    })
});

app.get('/tag/:id/parents/:maxdepth?', function (req, res) {
    getTags(res).then(tags => {
        res.send(tagsToRes(tagUtil.getAllParents(req.params.id, tags, req.params.maxdepth)));
    })
});

if (isProd) {
    https.createServer(credentials, app).listen(4000);
} else {
    http.createServer(app).listen(4000);
}

function getTags(response) {
    return new Promise((resolve, reject) => {
        couchDb.get("accessibility-info-tree", "TAGS_DOCUMENT_ID").then(({data, headers, status}) => {
            resolve(data.tags.map(tag => {
                delete tag.modelName;
                return tag;
            }));
        }, err => {
            response.status(500).send(err);
        });
    });
}

function tagsToRes(tags, single) {
    if (!tags || tags.length === 0) {
        return "";
    }
    tags = tags instanceof Array ? tags : [tags];
    tags.forEach(tag => {
        tag.labelDE = tag.label.de;
        tag.labelEN = tag.label.en ? tag.label.en : "";
        delete tag.label;
    });
    if (single) {
        return tags.length > 1 ? tags : tags[0];
    } else {
        return tags;
    }
}
