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
from ..kubernetes_entity import KubernetesEntity, async_cleanup_registry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    hub = hass.data[DOMAIN][entry.entry_id]

    await async_cleanup_registry(
        hass, entry, KUBERNETES_KIND_POD, hub.list_namespaces_func()
    )

    await hub.async_start_listener(
        async_add_entities, hub.list_namespaces_func(), NamespaceSensor
    )


class NamespaceSensor(KubernetesEntity, SensorEntity):
    def __init__(self, hub, data):
        super().__init__(hub, data, ENTITY_ID_FORMAT)

    @property
    def state(self) -> str:
        return self.getData().status.phase
