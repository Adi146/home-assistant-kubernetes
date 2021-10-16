from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.loader import async_get_integration

from ..const import (
    CONFIG_FLOW_PANEL,
    FRONTEND_PANEL_TITLE,
    FRONTEND_PANEL_ICON,
    URL_BASE,
    PANEL_URL,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_frontend(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    frontend_dir = Path(__file__).parent / "www"

    hass.http.register_static_path(URL_BASE, f"{frontend_dir}", False)

    await setup_cards(hass)

    if entry.data[CONFIG_FLOW_PANEL]:
        hass.components.frontend.async_register_built_in_panel(
            component_name="custom",
            sidebar_title=FRONTEND_PANEL_TITLE,
            sidebar_icon=FRONTEND_PANEL_ICON,
            frontend_url_path="kubernetes-frontend",
            config={
                "_panel_custom": {
                    "name": "kubernetes-frontend",
                    "embed_iframe": False,
                    "trust_external": False,
                    "module_url": PANEL_URL,
                }
            },
            require_admin=True,
        )


async def setup_cards(hass: HomeAssistant):
    hass.components.frontend.add_extra_js_url(hass, PANEL_URL)
