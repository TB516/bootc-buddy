import * as Layer from "effect/Layer";
import { NodeChildProcessSpawner, NodeFileSystem, NodePath } from "@effect/platform-node-shared";

/** Provides the Node services needed to spawn host commands from Effects. */
export const nodeProcessLayer = NodeChildProcessSpawner.layer.pipe(
  Layer.provide(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);
