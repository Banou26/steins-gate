import { Observable, of, generate, from, BehaviorSubject, zip } from 'rxjs'
import { takeUntil, publish, filter, map, mapTo, switchMap, groupBy, mergeMap, tap, skip, toArray } from 'rxjs/operators'
import browsersList from 'browserslist'

import Parcel from '../parcel/index.ts'
import { PARCEL_REPORTER_EVENT } from '../parcel/index.ts'
import WorkerFarm from '../workerFarm/index.ts'
import Task, { TASK_TYPE, TASK_STATUS } from './task.ts'
import emit from '../utils/emit.ts'
import AsyncObservable from '../utils/async-observable.ts'
import prepareRuntimes from '../runtimes/index.ts'

export default (parcelOptions) =>
  AsyncObservable(observer => {
    const bundle =
      (Parcel(parcelOptions)
      |> publish())
        .refCount()
  
    const analyze =
      bundle
      |> switchMap(bundle =>
        of(bundle)
        |> mergeMap(({ changedAssets }) => from(changedAssets.values()))
        |> groupBy(({ env: { context, engines: { browsers } } }) =>
          context === 'browser'
            ? ['chrome']
            // ? browsersList(browsers)
            //   .map(str => str.split(' '))
            //   .shift()
            : ['node']
        )
        |> mergeMap(group =>
          zip(
            of(group.key),
            group
          )
        )
        |> mergeMap(([contexts, asset]) =>
          from(contexts)
          |> map(context => [context, asset])
        )
        |> mergeMap(([context, asset]) => {
          debugger
        })
      )
  
    const analyzeSubscription = analyze.subscribe()
    return () => {
      analyzeSubscription.unsubscribe()
    }
  })
