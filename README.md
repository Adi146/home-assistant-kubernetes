[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

# Home Assistant Kubernetes Integration

This is a custom component for monitoring your Kubernetes cluster with Home Assistant.

## Installation

1. Install this Integration as a [HACS custom repository](https://hacs.xyz/docs/faq/custom_repositories) or just copy the content of the release zip to your custom_components directory.
2. Copy the config which you use to access your Kubernetes cluster to the config folder of your Home Assistant instace (usually you can find this file here: `~/.kube/config` or `/etc/kubernetes/admin.conf` on your master node)
3. Add the Integration in Home Assistant by navigating to Configuration -> Integrations -> Add Integration and search for *kubernetes*

## Sensors

The integration will create a seperate sensor for each Kubernetes component.
Following components are supported at the moment:

- Nodes
- Namespaces
- Deployments
- DaemonSets
- Pods

The sensors will be named with this schema: _kind__*namespace*__name_. For example a Pod sensor could be named *sensor.deployment_homeassistant_homeassistant_db*
You can find further details of the component in the attributes of the sensor. If you want to monitor specific details of a sensor you can create a template sensor like that: 

```{{ state_attr('sensor.daemonset_glances_glances', 'spec')["template"]["spec"]["containers"][0]["image"] }}```

Each sensor will be created and deleted dynamically. For example if a deployments spawns another Pod, there will be another sensor in your Home-Assistant. If the Pod gets deleted, the sensor will be removed as well.

## Services

The integration provides a few service for managing Kubernetes

### set_unschedulable

Set the unschedulable flag of a Node. Attention this will not drain the node!

```
service: kubernetes.set_unschedulable 
target: 
  entity_id: sensor.node_pi02 data: 
unschedulable: true
```

### set_image_deployment / set_image_daemon_set

Sets the image of a Deployment or DaemonSet. This service acts like kubectl set image.

```
service: kubernetes.set_image_deployment 
target:
  entity_id: sensor.deployment_homeassistant_homeassistant
data: 
  container: homeassistant
  image: homeassistant/home-assistant:2021.10
```

## Panel and Cards

Additionally the integration provides a basic custom panel for better overview (This is still under development and there will be big changes).
There are also a few custom cards which can be added to your lovelace dashboard.

### k8s-component-details

Provides details of a single Kubernetes component.

```
type: custom:k8s-component-details
entity: sensor.deployment_homeassistant_homeassistant
```

![k8s-component-details.png](/images/component-details-card.png)
