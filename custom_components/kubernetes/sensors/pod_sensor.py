"""Platform for deployment sensor integration."""
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
    ICON_POD_NOTOK,
    ICON_POD_OK,
    KUBERNETES_KIND_POD
)
from ..kubernetes_entity import KubernetesEntity, obj_to_dict

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    hub = hass.data[DOMAIN][entry.entry_id]

    await hub.async_start_listener(async_add_entities, hub.list_pods_func(), PodSensor)


class PodSensor(KubernetesEntity, SensorEntity):
    def __init__(self, hub, data):
        super().__init__(hub, data, ENTITY_ID_FORMAT)

    @property
    def state(self) -> str:
        if self.getData().status.container_statuses is not None:
            for container_status in self.getData().status.container_statuses:
                if container_status.state.waiting is not None:
                    return container_status.state.waiting.reason

        return self.getData().status.phase

    @staticmethod
    def kind() -> str:
        return KUBERNETES_KIND_POD

    def is_ok(self) -> bool:
        return (self.state == "Running")

    @property
    def extra_state_attributes(self) -> dict:
        attr = super().extra_state_attributes
        data = self.getData()

        # Add helpers for pod.
        # Conditions
        attr["conditions"] = obj_to_dict(data.status.conditions)

        # Namespace
        attr["namespace"] = data.metadata.namespace

        attr["node"] = data.spec.node_name
        attr["phase"] = data.status.phase
        attr["pod_ip"] = data.status.pod_ip

        attr["ok"] = self.is_ok()

        return attr

    @property
    def icon(self):
        if self.is_ok:
            return ICON_POD_OK
        else:
            return ICON_POD_NOTOK
