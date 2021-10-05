"""The kubernetes component."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, ServiceCall, callback

from .kubernetes_hub import KubernetesHub

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_services(
    hass: HomeAssistant,
    hub: KubernetesHub,
) -> None:

    return True


async def async_unload_services(
    hass: HomeAssistant,
) -> None:
    pass
