from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity import Entity, generate_entity_id
from homeassistant.helpers.entity_registry import (
    async_get_registry,
    async_entries_for_config_entry,
)


_LOGGER = logging.getLogger(__name__)


async def async_cleanup_registry(
    hass: HomeAssistant, entry: ConfigEntry, kind: str, list_func
):
    response = await list_func()

    registry = await async_get_registry(hass)
    for entity in async_entries_for_config_entry(registry, entry.entry_id):
        if entity.device_class == kind:
            for resource in response.items:
                if entity.unique_id == resource.metadata.uid:
                    break
            else:
                _LOGGER.warning(f"removing dead entity {entity.entity_id}")
                registry.async_remove(entity.entity_id)


class KubernetesEntity(Entity):
    def __init__(self, hub, data, entity_id_format) -> None:
        self.hub = hub
        self.setData(data)

        self.entity_id = generate_entity_id(
            entity_id_format, self._generateEntityIDName(), hass=self.hub.hass
        )

    @property
    def unique_id(self) -> str:
        return self.getData().metadata.uid

    @property
    def device_class(self) -> str:
        return self.getData().kind

    @property
    def name(self) -> str:
        return self.getData().metadata.name

    def getData(self) -> dict:
        return self.data

    def setData(self, data) -> None:
        self.data = data

    def _generateEntityIDName(self) -> str:
        if self.getData().metadata.namespace != None:
            return f"{self.getData().kind}_{self.getData().metadata.namespace}_{self.getData().metadata.name}"
        else:
            return f"{self.getData().kind}_{self.getData().metadata.name}"

    async def async_delete(self):
        registry = await async_get_registry(self.hub.hass)
        registry.async_remove(self.entity_id)

    @property
    def extra_state_attributes(self) -> dict:
        attributes = {}

        if self.getData().status.conditions != None:
            for condition in self.getData().status.conditions:
                attributes[condition.type] = condition.status

        return attributes
