from __future__ import annotations

import logging
from typing import Final

DOMAIN: Final = "kubernetes"

CONF_FILE = "./config"
UPDATE_INTERVAL = 30


SERVICE_SET_IMAGE_DEPLOYMENT = "set_image_deployment"
SERVICE_SET_IMAGE_DAEMONSET = "set_image_daemon_set"
SERVICE_SET_UNSCHEDULABLE = "set_unschedulable"

PARAM_CONTAINER = "container"
PARAM_IMAGE = "image"
PARAM_UNSCHEDULABLE = "unschedulable"

STATE_READY = "ready"
STATE_UNSCHEDULABLE = "unschedulable"

KUBERNETES_KIND_NODE = "Node"
KUBERNETES_KIND_DEPLOYMENT = "Deployment"
KUBERNETES_KIND_DAEMONSET = "DaemonSet"
KUBERNETES_KIND_POD = "Pod"
