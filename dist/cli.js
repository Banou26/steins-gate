'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var operators = require('rxjs/operators');
var Parcel$1 = _interopDefault(require('@parcel/core'));
var rxjs = require('rxjs');
var worker_threads = require('worker_threads');
var os = _interopDefault(require('os'));
var childProcess = _interopDefault(require('child_process'));

var AsyncObservable = (func => rxjs.Observable.create(observer => {
  const unsubscribe = func(observer);
  return async () => {
    var _ref;

    return (_ref = await unsubscribe) === null || _ref === void 0 ? void 0 : _ref();
  };
}));

let PARCEL_REPORTER_EVENT;

(function (PARCEL_REPORTER_EVENT) {
  PARCEL_REPORTER_EVENT["BUILD_START"] = "buildStart";
  PARCEL_REPORTER_EVENT["BUILD_PROGRESS"] = "buildProgress";
  PARCEL_REPORTER_EVENT["BUILD_SUCCESS"] = "buildSuccess";
  PARCEL_REPORTER_EVENT["BUILD_FAILURE"] = "buildFailure";
  PARCEL_REPORTER_EVENT["LOG"] = "log";
})(PARCEL_REPORTER_EVENT || (PARCEL_REPORTER_EVENT = {}));

var Parcel = (initialParcelOptions => AsyncObservable(async observer => {
  const parcel = new Parcel$1({
    entries: ['tests/unit/index_test.ts'],
    targets: {
      test: {
        distDir: '.epk/dist/browser',
        "browsers": ["> 1%", "not dead"]
      }
    },
    sourceMaps: true,
    minify: true,
    scopeHoist: true
  });
  const {
    unsubscribe
  } = await parcel.watch((err, build) => {
    if (err) observer.throw(err);
    observer.next(build);
  });
  return () => unsubscribe();
}));

var isBrowser = typeof window !== 'undefined';

let amount;

if (globalThis.window !== undefined) {
  amount = window.navigator.hardwareConcurrency;
} else {
  const exec = command => childProcess.execSync(command, {
    encoding: 'utf8'
  });

  const platform = os.platform();

  if (platform === 'linux') {
    const output = exec('lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l');
    amount = parseInt(output.trim(), 10);
  } else if (platform === 'darwin') {
    const output = exec('sysctl -n hw.physicalcpu_max');
    amount = parseInt(output.trim(), 10);
  } else if (platform === 'windows') {
    const output = exec('WMIC CPU Get NumberOfCores');
    amount = output.split(os.EOL).map(line => parseInt(line)).filter(value => !isNaN(value)).reduce((sum, number) => sum + number, 0);
  } else {
    const cores = os.cpus().filter(function (cpu, index) {
      const hasHyperthreading = cpu.model.includes('Intel');
      const isOdd = index % 2 === 1;
      return !hasHyperthreading || isOdd;
    });
    amount = cores.length;
  }
}

let TASK_TYPE;

(function (TASK_TYPE) {
  TASK_TYPE["PRE_ANALYZE"] = "preAnalyze";
  TASK_TYPE["RUN"] = "run";
  TASK_TYPE["ANALYZE"] = "analyze";
})(TASK_TYPE || (TASK_TYPE = {}));

let TASK_STATUS;

(function (TASK_STATUS) {
  TASK_STATUS["START"] = "start";
  TASK_STATUS["READY"] = "ready";
  TASK_STATUS["END"] = "end";
  TASK_STATUS["CANCEL"] = "cancel";
})(TASK_STATUS || (TASK_STATUS = {})); // export default
//   (task: Task) =>
//     messages =>
//       messages
//       |> 
// export default (task: Task) =>
//   Observable.create(observer => {
//     let _observer
//     const task = Observable.create<TaskMessage>(observer => {
//       _observer = observer
//       observer.next({ type: TASK_STATUS.START })
//       return () => observer.next({ type: TASK_STATUS.CANCEL })
//     })
//     workerFarm.next(task)
//     return () => _observer.complete()
//   })

var browserWorkerFarm = (() => {
  var _taskSubject;

  const idleWorker = Array(amount).fill(undefined).map(() => new worker_threads.Worker('./dist/worker.js'));
  const taskSubject = new rxjs.Subject();
  const queue = (_taskSubject = taskSubject, operators.mergeMap((task, _, count) => {
    var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _task;

    const worker = idleWorker.splice(0, 1)[0];
    const workerMessages = rxjs.fromEvent(worker, 'message');
    let done = false;
    let canceled = false;
    worker.postMessage({
      status: TASK_STATUS.START
    });
    return _ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_task = task, operators.finalize(() => {
      if (!done) canceled = true;
      if (canceled) worker.postMessage({
        status: TASK_STATUS.CANCEL
      });
      idleWorker.push(worker);
    })(_task)), operators.mergeMap(async value => value)(_ref7) // allow for the finalize to run before the task if it was canceled
    ), operators.filter(() => !canceled)(_ref6) // if it was canceled, filter everything out
    ), operators.tap(message => worker.postMessage(message))(_ref5)), operators.combineLatest(workerMessages, (_, message) => message)(_ref4) // switch the flow from having sent messages to receiving them
    ), operators.tap(({
      status
    }) => status === TASK_STATUS.END ? done = true : undefined)(_ref3)), operators.takeWhile(({
      status
    }) => status !== TASK_STATUS.END)(_ref2)), operators.map(message => [count, message])(_ref);
  }, amount)(_taskSubject));
  let taskCounter = 0;
  return messageObservable => {
    var _ref8, _queue;

    const replay = new rxjs.ReplaySubject();
    const count = taskCounter;
    taskCounter++;
    const result = (_ref8 = (_queue = queue, operators.filter(([_count]) => count === _count)(_queue)), operators.pluck(1)(_ref8));
    result.subscribe(replay);
    taskSubject.next(messageObservable);
    return replay;
  };
});

var tap = ((...args) => rxjs.isObservable(args[0]) ? operators.tap(value => args[0](value).subscribe()) : operators.tap(...args));

var nodeWorkerFarm = (taskSubject => {
  var _taskSubject;

  const idleWorker = Array(amount).fill(undefined).map(() => new worker_threads.Worker('./dist/worker.js'));
  return _taskSubject = taskSubject, operators.mergeMap((task, id) => {
    var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _task;

    const worker = idleWorker.splice(0, 1)[0];
    const workerMessages = rxjs.fromEvent(worker, 'message');
    let done = false;
    let canceled = false;
    return _ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_ref8 = (_task = task, tap(message => {
      var _ref9, _of;

      return _ref9 = (_of = rxjs.of(message), operators.first()(_of)), tap(message => worker.postMessage({
        id,
        status: TASK_STATUS.START,
        ...message
      }))(_ref9);
    })(_task)), operators.finalize(() => {
      if (!done) canceled = true;
      if (canceled) worker.postMessage({
        id,
        status: TASK_STATUS.CANCEL
      });
      idleWorker.push(worker);
    })(_ref8)), operators.mergeMap(async message => message)(_ref7) // allow for the finalize to run before the task if it was canceled
    ), operators.filter(() => !canceled)(_ref6) // if it was canceled, filter everything out
    ), tap(message => worker.postMessage({
      id,
      ...message
    }))(_ref5)), operators.combineLatest(workerMessages, (_, task) => task)(_ref4) // switch the flow from having sent messages to receiving them
    ), tap(({
      status
    }) => status === TASK_STATUS.END && (done = true))(_ref3)), operators.takeWhile(({
      status
    }) => status !== TASK_STATUS.END)(_ref2)), operators.map(message => [id, message])(_ref);
  }, amount)(_taskSubject);
});

var WorkerFarm = (() => {
  const taskSubject = new rxjs.Subject();
  const queue = isBrowser ? browserWorkerFarm() : nodeWorkerFarm(taskSubject);
  let idCounter = 0;
  return messageObservable => {
    var _ref, _queue;

    const replay = new rxjs.ReplaySubject();
    const id = idCounter;
    idCounter++;
    const result = (_ref = (_queue = queue, operators.filter(([_id]) => _id === id)(_queue)), operators.pluck(1)(_ref));
    result.subscribe(replay);
    taskSubject.next(messageObservable);
    return replay;
  };
});

var emit = (value => rxjs.Observable.create(observer => observer.next(value)));

var EPK = (parcelOptions => AsyncObservable(observer => {
  var _Parcel, _parcelBundle, _bundle;

  const workerFarm = WorkerFarm();
  const parcelBundle = (_Parcel = Parcel(), operators.publish()(_Parcel)).refCount();
  const bundle = (_parcelBundle = parcelBundle, operators.map(bundle => ({
    bundle,
    parcelOptions
  }))(_parcelBundle));
  const test = (_bundle = bundle, operators.switchMap(bundle => {
    var _emit;

    return _emit = emit({
      type: TASK_TYPE.ANALYZE
    }), workerFarm(_emit);
  })(_bundle));
  const result = test;
  result.subscribe(observer);
  return () => {};
}));

// import Parcel from '@parcel/core'

const run = entryFiles => {
  const epk = EPK({
    entryFiles
  });
  epk.subscribe(v => console.log(v));
};

run();
//# sourceMappingURL=cli.js.map
