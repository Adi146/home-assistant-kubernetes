"""Platform for node sensor integration."""
from __future__ import annotations

import logging
import voluptuous as vol

from homeassistant.components.sensor import ENTITY_ID_FORMAT, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers import config_validation as cv, entity_platform

from .const import (
    DOMAIN,
    SERVICE_SET_UNSCHEDULABLE,
    PARAM_UNSCHEDULABLE,
    STATE_READY,
    STATE_UNSCHEDULABLE,
    KUBERNETES_KIND_NODE,
)

from .kubernetes_entity import KubernetesEntity, async_cleanup_registry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    platform = entity_platform.async_get_current_platform()

    hub = hass.data[DOMAIN][entry.entry_id]

    await async_cleanup_registry(
        hass, entry, KUBERNETES_KIND_NODE, hub.list_nodes_func()
    )

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
        return STATE_UNSCHEDULABLE if self.getData().spec.unschedulable else STATE_READY

    async def set_unschedulable(self, unschedulable: bool) -> None:
        await self.hub.set_unschedulable(self.getData().metadata.name, unschedulable)
