// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  StoreService,
  NodeConfig,
  ConnectionPoolStateManager,
  IProjectUpgradeService,
  PoiSyncService,
  InMemoryCacheService,
  MonitorService,
  CoreModule,
  IStoreModelProvider,
  ConnectionPoolService,
} from '@subql/node-core';
import { SubqueryProject } from '../configure/SubqueryProject';
import { ApiService } from './api.service';
import { ApiPromiseConnection } from './apiPromise.connection';
import {
  BlockDispatcherService,
  WorkerBlockDispatcherService,
} from './blockDispatcher';
import { SubstrateDictionaryService } from './dictionary/substrateDictionary.service';
import { DsProcessorService } from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { FetchService } from './fetch.service';
import { IndexerManager } from './indexer.manager';
import { ProjectService } from './project.service';
import { RuntimeService } from './runtime/runtimeService';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';

@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: ApiService,
      useFactory: ApiService.init,
      inject: [
        'ISubqueryProject',
        ConnectionPoolService,
        EventEmitter2,
        NodeConfig,
      ],
    },
    IndexerManager,
    {
      provide: 'IBlockDispatcher',
      useFactory: (
        nodeConfig: NodeConfig,
        eventEmitter: EventEmitter2,
        projectService: ProjectService,
        projectUpgradeService: IProjectUpgradeService,
        apiService: ApiService,
        indexerManager: IndexerManager,
        cacheService: InMemoryCacheService,
        storeService: StoreService,
        storeModelProvider: IStoreModelProvider,
        poiSyncService: PoiSyncService,
        project: SubqueryProject,
        dynamicDsService: DynamicDsService,
        unfinalizedBlocks: UnfinalizedBlocksService,
        connectionPoolState: ConnectionPoolStateManager<ApiPromiseConnection>,
        monitorService?: MonitorService,
      ) =>
        nodeConfig.workers
          ? new WorkerBlockDispatcherService(
            nodeConfig,
            eventEmitter,
            projectService,
            projectUpgradeService,
            cacheService,
            storeService,
            storeModelProvider,
            poiSyncService,
            project,
            dynamicDsService,
            unfinalizedBlocks,
            connectionPoolState,
            monitorService,
          )
          : new BlockDispatcherService(
            apiService,
            nodeConfig,
            indexerManager,
            eventEmitter,
            projectService,
            projectUpgradeService,
            storeService,
            storeModelProvider,
            poiSyncService,
            project,
          ),
      inject: [
        NodeConfig,
        EventEmitter2,
        'IProjectService',
        'IProjectUpgradeService',
        ApiService,
        IndexerManager,
        InMemoryCacheService,
        StoreService,
        'IStoreModelProvider',
        PoiSyncService,
        'ISubqueryProject',
        DynamicDsService,
        UnfinalizedBlocksService,
        ConnectionPoolStateManager,
        MonitorService,
      ],
    },
    FetchService,
    SubstrateDictionaryService,
    DsProcessorService,
    DynamicDsService,
    {
      useClass: ProjectService,
      provide: 'IProjectService',
    },
    UnfinalizedBlocksService,
    RuntimeService,
  ],
})
export class FetchModule {}
