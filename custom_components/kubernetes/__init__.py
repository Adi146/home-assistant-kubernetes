"""The kubernetes component."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.config_entries import ConfigEntry

from .kubernetes_hub import KubernetesHub

from .const import DOMAIN
from .services import async_setup_services, async_unload_services

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    hub = KubernetesHub(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = hub

    await hub.async_start()

    hass.config_entries.async_setup_platforms(entry, ["sensor"])
    await async_setup_services(hass, hub)

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    hass.data[DOMAIN].pop(entry.entry_id)

    await async_unload_services(hass)

    return True
