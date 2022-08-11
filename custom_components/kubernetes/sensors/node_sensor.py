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
      attr = super().extra_state_attributes
      data = self.getData()

      # Add helpers for node.
      # Addresses
      attr["addresses"] = super().obj_to_dict(data.status.addresses)

      # Conditions
      attr["conditions"] = super().obj_to_dict(data.status.conditions)

      # Labels
      attr["labels"] = super().obj_to_dict(data.metadata.labels)

      # Node info
      ni = data.status.node_info

      attr["architecture"] = ni.architecture
      attr["boot_id"] = ni.boot_id
      attr["container_runtime_version"] = ni.container_runtime_version
      attr["kernel_version"] = ni.kernel_version
      attr["kube_proxy_version"] = ni.kube_proxy_version
      attr["kubelet_version"] = ni.kubelet_version
      attr["machine_id"] = ni.machine_id
      attr["operating_system"] = ni.operating_system
      attr["os_image"] = ni.os_image
      attr["system_uuid"] = ni.system_uuid

      attr["pod_cidr"] = data.spec.pod_cidr

      return attr
