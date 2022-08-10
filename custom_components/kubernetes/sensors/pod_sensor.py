"""Platform for deployment sensor integration."""
from __future__ import annotations

import logging
import voluptuous as vol

from homeassistant.components.sensor import ENTITY_ID_FORMAT, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers import config_validation as cv, entity_platform

from ..const import DOMAIN, KUBERNETES_KIND_POD
from ..kubernetes_entity import KubernetesEntity

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

    @property
    def extra_state_attributes(self) -> dict:
        d = super().extra_state_attributes

        # Add helpers for pod.
        # Conditions
        d["conditions"] = d["status"]["conditions"]

        d["node"] = d["spec"]["node_name"]
        d["phase"] = d["status"]["phase"]
        d["pod_ip"] = d["status"]["pod_ip"]

        return d
