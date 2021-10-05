"""Platform for sensor integration."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .node_sensor import async_setup_entry as async_node_setup_entry
from .deployment_sensor import async_setup_entry as async_deployment_setup_entry
from .daemon_set_sensor import async_setup_entry as async_daemon_set_setup_entry
from .pod_sensor import async_setup_entry as async_pod_setup_entry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    await async_node_setup_entry(hass, entry, async_add_entities)
    await async_deployment_setup_entry(hass, entry, async_add_entities)
    await async_daemon_set_setup_entry(hass, entry, async_add_entities)
    await async_pod_setup_entry(hass, entry, async_add_entities)
