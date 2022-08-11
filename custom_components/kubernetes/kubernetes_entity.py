from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity, generate_entity_id


_LOGGER = logging.getLogger(__name__)


def obj_to_dict(obj):
    res = obj

    if hasattr(obj, "attribute_map"):
        res = {}
        for attribute_key in obj.attribute_map:
            attr = getattr(obj, attribute_key)
            res[attribute_key] = obj_to_dict(attr)
    if isinstance(obj, dict):
        res = {}
        for key, val in obj.items():
            res[key] = obj_to_dict(val)
    if isinstance(obj, list):
        res = []
        for val in obj:
            res.append(obj_to_dict(val))

    return res


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

    @property
    def extra_state_attributes(self) -> dict:
        dict = { "raw" : obj_to_dict(self.getData()) }
        dict["kind"] = self.getData().kind
        return 
