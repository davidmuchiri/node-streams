#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const util = require('util');
const getStdin = require('get-stdin');

const args = require('minimist')(
    process.argv.slice(2), {
        boolean: ['help', 'in'],
        string: ['file'],
    },
);

function printHelp() {
    console.log(' index usage: ');
    console.log(' index.js --file={FILENAME} ');
    console.log('');
    console.log(' --help                              print this help ');
    console.log(' --file={FILENAME}                    process the file ');
    console.log('');
    console.log(' --in, -                     process stdin');
    console.log('');
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if (includeHelp) {
        console.log('');
        printHelp();
    }
}

function processFile(file = '', basePath) {
    const filePath = path.join(basePath, file);
    const readFile = (err, fileContent) => {
        if (err) {
            error(err.toString());
            return;
        }
        console.log(fileContent.toString());
    };
    fs.readFile(filePath, readFile);
}

function processStdin() {
    getStdin()
        .then((contents) => {
            console.log(contents.toString());
        })
        .catch((err) => {
            error(err);
        });
}

function main() {
    const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);


    if (args.help) {
        printHelp();
        return;
    }
    if (args.file) {
        processFile(args.file, BASE_PATH);
        return;
    }
    if (args.in || args._.includes('-')) {
        processStdin();
        return;
    }
    error('Incorrect usage.', true);
}

main();
