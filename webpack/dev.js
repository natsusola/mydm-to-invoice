const electron = require('electron');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackHotMiddleware = require('webpack-hot-middleware');
const path = require('path');
const { spawn } = require('child_process');

const mainConfig = require('./webpack.main.config.js');
const rendererConfig = require('./webpack.renderer.config.js');

let electronProcess = null;
let manualRestart = false;
let hotMiddleware;

process.env.TARGET = 'electron';

function startRenderer() {
  return new Promise((resolve, reject) => {
    rendererConfig.entry.app = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.app);
    const complier = webpack(rendererConfig);
    hotMiddleware = webpackHotMiddleware(complier, {
      log: false,
      heartbeat: 2500
    });

    complier.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
        hotMiddleware.publish({ action: 'reload' })
        cb()
      });
    });

    const server = new webpackDevServer(
      complier, {
        contentBase: path.join(__dirname, '../dist'),
        before (app, ctx) {
          app.use(hotMiddleware)
          ctx.middleware.waitUntilValid(() => { resolve(); })
        }
      }
    );

    server.listen(9090);
  });
}

function startMain() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(mainConfig);

    compiler.plugin('watch-run', (compilation, done) => {
      hotMiddleware.publish({ action: 'compiling' });
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        return;
      }

      if (electronProcess && electronProcess.kill) {
        manualRestart = true;
        process.kill(electronProcess.pid);
        electronProcess = null;
        startElectron();

        setTimeout(() => {
          manualRestart = false;
        }, 5000);
      }
      resolve();
    });
  });
}

function startElectron() {
  electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/main.js')]);
  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function init() {
  Promise.all([startRenderer(), startMain()])
    .then(() => { startElectron(); })
    .catch(console.err);
}

init();
