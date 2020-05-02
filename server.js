const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const uuid = require('uuid');
const koaStatic = require('koa-static');
const fs = require('fs');
const path = require('path');

const public = path.join(__dirname, '/public');
app.use(koaStatic(public));

// Для heroku
const port = process.env.PORT || 7070;
// const port = 7070;
const server = http.createServer(app.callback()).listen(port);



//Слайд 52 CORS
// app.use(async (ctx, next) => {
//     const origin = ctx.request.get('Origin');
//     if (!origin) {
//         return await next();
//     }
//     const headers = { 'Access-Control-Allow-Origin': '*', };
//     if (ctx.request.method !== 'OPTIONS') {
//         ctx.response.set({...headers});
//         try {
//             return await next();
//         } catch (e) {
//             e.headers = {...e.headers, ...headers};
//             throw e;
//         }
//     }
//     if (ctx.request.get('Access-Control-Request-Method')) {
//         ctx.response.set({
//             ...headers,
//             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
//         });
//         if (ctx.request.get('Access-Control-Request-Headers')) {
//             ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
//         }
//         ctx.response.status = 204; // No content
//     }
// });

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

let imgContainer = [];

app.use(async (ctx, next) => {

  const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }
    const headers = { 'Access-Control-Allow-Origin': '*', };
    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });
        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
        }
        ctx.response.status = 204; // No content
    }



  if (ctx.request.method === 'POST') {
    console.log(ctx.request);
    const { file } = ctx.request.files;
    console.log(file);
    let id = uuid.v4();
    let fileType = file.name.match(/(?<=\.).+$/).toString();
    console.log(fileType);
    let codedImg = `${id}.${fileType}`;
    const copyOnServer = new Promise((resolve, reject) => {
       fs.copyFile(file.path, `${public}/${codedImg}`, (err) => {
        if (err) {
        reject(err);
        } else {
        console.log('copyFile work');
        imgContainer.push(`${codedImg}`);
        console.log(imgContainer);
        resolve(codedImg);
      }
      });
    });
    ctx.response.body = 'Успешно загружено';
  }

  if (ctx.request.method === 'GET') {
    ctx.response.body = imgContainer;
  }
  if (ctx.request.method === 'DELETE') {
    targetImg = ctx.request.url.toString();
    targetImg = targetImg.replace('/?', '');
    const targetIndex = imgContainer.findIndex((image) => image === targetImg);
    imgContainer.splice(targetIndex, 1);
    fs.unlink(`${public}/${targetImg}`, (err) => {
      if (err) {
        console.log('Error during delete');
      } 
    });
    ctx.response.body = 'Image deleted';
  }

});
