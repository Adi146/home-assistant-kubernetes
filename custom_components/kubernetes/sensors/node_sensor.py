"""Platform for node sensor integration."""
from __future__ import annotations

import logging
import voluptuous as vol

from homeassistant.components.sensor import ENTITY_ID_FORMAT, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers import config_validation as cv, entity_platform

from ..const import (
    DOMAIN,
    SERVICE_SET_UNSCHEDULABLE,
    PARAM_UNSCHEDULABLE,
    STATE_READY,
    STATE_UNSCHEDULABLE,
    KUBERNETES_KIND_NODE,
)

from ..kubernetes_entity import KubernetesEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    platform = entity_platform.async_get_current_platform()

    hub = hass.data[DOMAIN][entry.entry_id]

    await hub.async_start_listener(
        async_add_entities, hub.list_nodes_func(), NodeSensor
    )

    platform.async_register_entity_service(
        SERVICE_SET_UNSCHEDULABLE,
        {
            vol.Required(PARAM_UNSCHEDULABLE): cv.boolean,
        },
        "set_unschedulable",
    )


class NodeSensor(KubernetesEntity, SensorEntity):
    def __init__(self, hub, data):
        super().__init__(hub, data, ENTITY_ID_FORMAT)

    @property
    def state(self) -> str:
        if self.getData().spec.unschedulable:
            return STATE_UNSCHEDULABLE

        for condition in self.getData().status.conditions:
            if condition.type == "Ready":
                return condition.reason

    @staticmethod
    def kind() -> str:
        return KUBERNETES_KIND_NODE

    async def set_unschedulable(self, unschedulable: bool) -> None:
        await self.hub.set_unschedulable(self.getData().metadata.name, unschedulable)

    @property
    def extra_state_attributes(self) -> dict:
      d = super().extra_state_attributes

      # Add helpers for node.
      # Addresses
      d["addresses"] = d["status"]["addresses"]

      # Conditions
      d["conditions"] = d["status"]["conditions"]

      # Node info
      d["architecture"] = d["status"]["node_info"]["architecture"]
      d["boot_id"] = d["status"]["node_info"]["boot_id"]
      d["container_runtime_version"] = d["status"]["node_info"]["container_runtime_version"]
      d["kernel_version"] = d["status"]["node_info"]["kernel_version"]
      d["kube_proxy_version"] = d["status"]["node_info"]["kube_proxy_version"]
      d["kubelet_version"] = d["status"]["node_info"]["kubelet_version"]
      d["labels"] = d["metadata"]["labels"]
      d["machine_id"] = d["status"]["node_info"]["machine_id"]
      d["operating_system"] = d["status"]["node_info"]["operating_system"]
      d["os_image"] = d["status"]["node_info"]["os_image"]
      d["pod_cidr"] = d["spec"]["pod_cidr"]
      d["system_uuid"] = d["status"]["node_info"]["system_uuid"]

      return d
