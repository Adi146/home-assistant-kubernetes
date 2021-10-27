from __future__ import annotations

import logging
import asyncio
from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_registry import (
    async_get,
    async_entries_for_config_entry,
)

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
    def __init__(self, hass: HomeAssistant, entry: ConfigEntry = None) -> None:
        self.hass = hass
        self.entry = entry

    async def async_start(self):
        await config.load_kube_config(config_file=self.hass.config.path(CONF_FILE))
        self.core_v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()

    async def async_start_listener(self, async_add_entities, list_func, listener_class):
        asyncio.create_task(
            self.subscribe_events(async_add_entities, list_func, listener_class)
        )

    async def setup_entities(
        self, async_add_entities, list_func, entity_class, entities
    ):
        registry = async_get(self.hass)
        response = await list_func()
        existing_entities = async_entries_for_config_entry(
            registry, self.entry.entry_id
        )

        for entity in existing_entities:
            if entity.device_class == entity_class.kind():
                for resource in response.items:
                    if entity.unique_id == resource.metadata.uid:
                        break
                else:
                    _LOGGER.warning(f"removing dead entity {entity.entity_id}")
                    registry.async_remove(entity.entity_id)

        for resource in response.items:
            if resource.kind is None:
                resource.kind = entity_class.kind()

            if resource.metadata.uid in entities:
                entities[resource.metadata.uid].setData(resource)
            else:
                sensor = entity_class(self, resource)
                entities[resource.metadata.uid] = sensor
                async_add_entities([sensor])

        return response.metadata.resource_version

    async def subscribe_events(self, async_add_entities, list_func, entity_class):
        entities = {}
        registry = async_get(self.hass)

        w = watch.Watch()
        while True:
            resource_version = await self.setup_entities(
                async_add_entities, list_func, entity_class, entities
            )

            try:
                async for event in w.stream(
                    list_func, resource_version=resource_version
                ):
                    resource = event["object"]
                    eventType = event["type"]

                    _LOGGER.warning(
                        f"{resource.kind} {eventType} {resource.metadata.name}"
                    )

                    if eventType == "ADDED" and resource.metadata.uid not in entities:
                        sensor = entity_class(self, resource)
                        entities[resource.metadata.uid] = sensor
                        async_add_entities([sensor])
                    else:
                        if resource.metadata.uid not in entities:
                            _LOGGER.warning(
                                f"received {eventType} event for non existing entity {resource.metadata.name}"
                            )
                            continue

                        if (
                            eventType == "MODIFIED"
                            and resource.metadata.uid in entities
                        ):
                            entities[resource.metadata.uid].setData(resource)
                        elif (
                            eventType == "DELETED" and resource.metadata.uid in entities
                        ):
                            registry.async_remove(
                                entities[resource.metadata.uid].entity_id
                            )
                            entities.pop(resource.metadata.uid)

            except client.exceptions.ApiException as err:
                _LOGGER.error(f"api exception for {entity_class.kind()} watcher: {err}")

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
