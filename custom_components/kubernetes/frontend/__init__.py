from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.loader import async_get_integration

from ..const import DOMAIN, FRONTEND_PANEL_TITLE, FRONTEND_PANEL_ICON, URL_BASE

_LOGGER = logging.getLogger(__name__)


async def async_setup_frontend(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    frontend_dir = Path(__file__).parent / "www"
    panel_url = f"{URL_BASE}/panel.js"

    hass.http.register_static_path(URL_BASE, f"{frontend_dir}", True)

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
                "module_url": panel_url,
            }
        },
        require_admin=True,
    )
