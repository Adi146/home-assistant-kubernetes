from __future__ import annotations

import logging
from typing import Final

DOMAIN: Final = "kubernetes"

CONF_FILE = "./config"

SERVICE_SET_IMAGE_DEPLOYMENT = "set_image_deployment"
SERVICE_SET_IMAGE_DAEMONSET = "set_image_daemon_set"
SERVICE_SET_UNSCHEDULABLE = "set_unschedulable"

PARAM_CONTAINER = "container"
PARAM_IMAGE = "image"
PARAM_UNSCHEDULABLE = "unschedulable"

STATE_READY = "ready"
STATE_UNSCHEDULABLE = "Unschedulable"

KUBERNETES_KIND_NODE = "Node"
KUBERNETES_KIND_DEPLOYMENT = "Deployment"
KUBERNETES_KIND_DAEMONSET = "DaemonSet"
KUBERNETES_KIND_POD = "Pod"
KUBERNETES_KIND_NAMESPACE = "Namespace"

URL_BASE = "/kubernetes"
PANEL_URL = f"{URL_BASE}/panel.js"

FRONTEND_PANEL_TITLE = "Kubernetes"
FRONTEND_PANEL_ICON = "mdi:kubernetes"

ICON_NODE_OK = "mdi:server-network"
ICON_NODE_NOTOK = "mdi:server-network-off"
ICON_DAEMONSET_OK = "mdi:checkbox-multiple-marked"
ICON_DAEMONSET_NOTOK = "mdi:close-box-multiple"
ICON_DEPLOYMENT_OK = "mdi:checkbox-multiple-marked"
ICON_DEPLOYMENT_NOTOK = "mdi:close-box-multiple"
ICON_POD_OK = "mdi:archive-outline"
ICON_POD_NOTOK = "mdi:archive-off-outline"
