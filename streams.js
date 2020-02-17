#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');
const zlib = require('zlib');

const args = require('minimist')(
    process.argv.slice(2), {
        boolean: [
            'help',
            'in',
            'out',
            'compress',
            'decompress',
        ],
        string: [
            'file',
        ],
    },
);

function printHelp() {
    console.log('streams.js usage:');
    console.log('streams.js --file={FILENAME}');
    console.log('');
    console.log('--help                      print this help');
    console.log('--file={FILENAME}           process the file');
    console.log('');
    console.log('--in, -                     process stdin');
    console.log('--out                       print to stdout');
    console.log('--compress                  gzip the output');
    console.log('--decompress                unzip the output');
    console.log('');
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if (includeHelp) {
        console.log('');
        printHelp();
    }
}

function processStream(inStream, basePath) {
    const upperCaseStream = new Transform({
        transform(chunk, encoding, next) {
            this.push(chunk.toString().toUpperCase());
            next();
        },
    });

    if (args.out) {
        const outStream = process.stdout;

        if (args.compress) {
            const gzipStream = zlib.createGzip();
            inStream.pipe(upperCaseStream).pipe(gzipStream).pipe(outStream);
            return;
        }

        if (args.decompress) {
            const gunzipStream = zlib.createGunzip();
            inStream.pipe(gunzipStream).pipe(upperCaseStream).pipe(outStream);
            return;
        }

        inStream.pipe(upperCaseStream).pipe(outStream);
        return;
    }


    if (args.compress) {
        const outFile = path.join(basePath, './out.txt.gz');
        const outStream = fs.createWriteStream(outFile);
        const gzipStream = zlib.createGzip();
        inStream.pipe(upperCaseStream).pipe(gzipStream).pipe(outStream);
        return;
    }

    const outFile = path.join(basePath, './out.txt');
    const outStream = fs.createWriteStream(outFile);

    if (args.decompress) {
        const gunzipStream = zlib.createGunzip();
        inStream.pipe(gunzipStream).pipe(upperCaseStream).pipe(outStream);
        return;
    }

    inStream.pipe(upperCaseStream).pipe(outStream);
}

function processFile(file = '', basePath) {
    const filePath = path.join(basePath, file);
    const inStream = fs.createReadStream(filePath);
    processStream(inStream, basePath);
}

function processStdin(basePath) {
    const inStream = fs.createReadStream(process.stdin);
    processStream(inStream, basePath);
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
        processStdin(BASE_PATH);
        return;
    }
    error('Incorrect usage.', true);
}

main();
