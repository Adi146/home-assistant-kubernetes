from __future__ import annotations

import logging
import asyncio
from datetime import datetime

from homeassistant.core import HomeAssistant

from kubernetes_asyncio import client, config, watch

from .const import (
    CONF_FILE,
    SERVICE_SET_IMAGE_DEPLOYMENT,
    KUBERNETES_KIND_DEPLOYMENT,
    KUBERNETES_KIND_DAEMONSET,
)
from .kubernetes_entity import KubernetesEntity

_LOGGER = logging.getLogger(__name__)


class KubernetesHub:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def async_start(self):
        await config.load_kube_config(config_file=self.hass.config.path(CONF_FILE))
        self.core_v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()

    async def async_start_listener(self, async_add_entities, list_func, listener_class):
        asyncio.create_task(
            self.subscribe_events(async_add_entities, list_func, listener_class)
        )

    async def subscribe_events(self, async_add_entities, list_func, listener_class):
        w = watch.Watch()
        listeners = {}

        while True:
            try:
                async for event in w.stream(list_func):
                    ressource = event["object"]

                    _LOGGER.info(
                        f"{ressource.kind} {event['type']} {ressource.metadata.name}"
                    )

                    if (
                        event["type"] == "ADDED"
                        and ressource.metadata.uid not in listeners
                    ):
                        sensor = listener_class(self, ressource)
                        listeners[ressource.metadata.uid] = sensor
                        async_add_entities([sensor])
                    elif (
                        event["type"] == "MODIFIED"
                        and ressource.metadata.uid in listeners
                    ):
                        listeners[ressource.metadata.uid].setData(ressource)
                    elif (
                        event["type"] == "DELETED"
                        and ressource.metadata.uid in listeners
                    ):
                        await listeners[ressource.metadata.uid].async_delete()
                        listeners.pop(ressource.metadata.uid)

            except client.exceptions.ApiException as err:
                _LOGGER.error(err)

    def list_nodes_func(self):
        return self.core_v1.list_node

    def list_deployments_func(self):
        return self.apps_v1.list_deployment_for_all_namespaces

    def list_daemon_sets_func(self):
        return self.apps_v1.list_daemon_set_for_all_namespaces

    def list_pods_func(self):
        return self.core_v1.list_pod_for_all_namespaces

    def list_namespaces_func(self):
        return self.core_v1.list_namespace

    async def set_unschedulable(self, node: str, unschedulable: bool):
        body = {"spec": {"unschedulable": unschedulable}}

        await self.core_v1.patch_node(node, body)

    async def set_image(self, entity: KubernetesEntity, container: str, image: str):
        for existingContainer in entity.getData().spec.template.spec.containers:
            if existingContainer.name == container and existingContainer.image == image:
                return

        body = {
            "metadata": {
                "annotations": {
                    "kubernetes.io/change-cause": f"home-assistant {SERVICE_SET_IMAGE_DEPLOYMENT} {image}"
                }
            },
            "spec": {
                "template": {
                    "metadata": {
                        "annotations": {
                            "home-assistant/restartAt": str(
                                datetime.utcnow().isoformat("T") + "Z"
                            )
                        }
                    },
                    "spec": {"containers": [{"name": container, "image": image}]},
                }
            },
        }

        if entity.getData().kind == KUBERNETES_KIND_DEPLOYMENT:
            await self.apps_v1.patch_namespaced_deployment(
                entity.getData().metadata.name,
                entity.getData().metadata.namespace,
                body,
            )
        elif entity.getData().kind == KUBERNETES_KIND_DAEMONSET:
            await self.apps_v1.patch_namespaced_daemon_set(
                entity.getData().metadata.name,
                entity.getData().metadata.namespace,
                body,
            )
