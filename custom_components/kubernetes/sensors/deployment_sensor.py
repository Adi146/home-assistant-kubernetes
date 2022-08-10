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
    SERVICE_SET_IMAGE_DEPLOYMENT,
    PARAM_CONTAINER,
    PARAM_IMAGE,
    KUBERNETES_KIND_DEPLOYMENT,
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
        async_add_entities, hub.list_deployments_func(), DeploymentSensor
    )

    platform.async_register_entity_service(
        SERVICE_SET_IMAGE_DEPLOYMENT,
        {
            vol.Required(PARAM_CONTAINER): cv.string,
            vol.Required(PARAM_IMAGE): cv.string,
        },
        "set_image",
    )


class DeploymentSensor(KubernetesEntity, SensorEntity):
    def __init__(self, hub, data):
        super().__init__(hub, data, ENTITY_ID_FORMAT)

    @property
    def state(self) -> str:
        return self.getData().status.ready_replicas

    @staticmethod
    def kind() -> str:
        return KUBERNETES_KIND_DEPLOYMENT

    async def set_image(self, container: str, image: str) -> None:
        await self.hub.set_image(
            self,
            container,
            image,
        )

    @property
    def extra_state_attributes(self) -> dict:
        d = super().extra_state_attributes

        # Add helpers for deployment.
        d["conditions"] = d["status"]["conditions"]

        d["paused"] = d["spec"]["paused"]
        d["specified_replicas"] = d["spec"]["replicas"]
        d["available_replicas"] = d["status"]["available_replicas"]
        d["unavailable_replicas"] = d["status"]["unavailable_replicas"]

        return d
