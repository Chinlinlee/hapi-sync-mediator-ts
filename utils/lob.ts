import stream from 'stream';
import zlib from 'zlib';
export const convertLOBToJson = (iLOB: any) => {
    return new Promise((resolve, reject)=> {
        let buffer: any[] = [];
        let bufferStream = new stream.PassThrough();
    
        // Write your buffer
        bufferStream.end(Buffer.from(iLOB.lo_get));
    
        // Pipe it to something else  (i.e. stdout)
        let gunzip = zlib.createGunzip();
        bufferStream.pipe(gunzip);
        gunzip.on('data', function (data) {
            // decompression chunk ready, add it to the buffer
            buffer.push(data.toString());
    
        }).on("end", function () {
            // response and decompression complete, join the buffer and return
            //callback(null, buffer.join(""));
            let bufferStr = buffer.join("");
            let jsonItem = JSON.parse(bufferStr);
            resolve(jsonItem);
        }).on("error", function (e) {
            //callback(e);
            reject(e);
        });
    })
}