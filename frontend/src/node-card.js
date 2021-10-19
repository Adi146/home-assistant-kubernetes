import { LitElement, html, css } from "lit";

import {
  getConditions,
  getConditionsAsSpans,
  getName,
  getNamespace,
} from "./helpers.js";

export class ComponentDetailsCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = config;
  }

  renderNamespace(entity) {
    if (!entity.attributes.metadata.namespace) return;
    return html`
      <tr>
        <th>Namespace</th>
        <td>
          <div>${getNamespace(entity)}</div>
        </td>
      </tr>
    `;
  }

  renderCreationTimestamp(entity) {
    if (!entity.attributes.metadata.creation_timestamp) return;
    return html`
      <tr>
        <th>Created</th>
        <td>
          <div>${entity.attributes.metadata.creation_timestamp}</div>
        </td>
      </tr>
    `;
  }

  renderLabels(entity) {
    if (!entity.attributes.metadata.labels) return;
    return html`
      <tr>
        <th>Labels</th>
        <td>
          ${Object.entries(entity.attributes.metadata.labels).map((label) => {
            var text = label.filter((val) => val != "").join("=");
            return html`<div title=${text}>${text}</div>`;
          })}
        </td>
      </tr>
    `;
  }

  renderAnnotations(entity) {
    if (!entity.attributes.metadata.annotations) return;
    return html`
      <tr>
        <th>Annotations</th>
        <td>
          ${Object.entries(entity.attributes.metadata.annotations).map(
            (label) => {
              var text = label.filter((val) => val != "").join("=");
              return html`<div title=${text}>${text}</div>`;
            }
          )}
        </td>
      </tr>
    `;
  }

  renderConditions(entity) {
    if (!entity.attributes.status) return;
    return html`
      <tr>
        <th>Conditions</th>
        <td>${getConditionsAsSpans(getConditions(entity))}</td>
      </tr>
    `;
  }

  renderCapacity(entity) {
    if (!entity.attributes.status.capacity) return;
    return html`
      <tr>
        <th>Capicity</th>
        <td>
          <div>CPU: ${entity.attributes.status.capacity.cpu}</div>
          <div>Memory: ${entity.attributes.status.capacity.memory}</div>
          <div>Pods: ${entity.attributes.status.capacity.pods}</div>
        </td>
      </tr>
    `;
  }

  renderAllocatable(entity) {
    if (!entity.attributes.status.allocatable) return;
    return html`
      <tr>
        <th>Allocatable</th>
        <td>
          <div>CPU: ${entity.attributes.status.allocatable.cpu}</div>
          <div>Memory: ${entity.attributes.status.allocatable.memory}</div>
          <div>Pods: ${entity.attributes.status.capacity.pods}</div>
        </td>
      </tr>
    `;
  }

  renderAddresses(entity) {
    if (!entity.attributes.status.addresses) return;
    return html`
      <tr>
        <th>Addresses</th>
        <td>
          ${entity.attributes.status.addresses.map((address) => {
            return html`<div>${address.type}: ${address.address}</div>`;
          })}
        </td>
      </tr>
    `;
  }

  renderOS(entity) {
    if (!entity.attributes.status.node_info) return;
    return html`
      <tr>
        <th>OS</th>
        <td>
          <div>
            Architecture: ${entity.attributes.status.node_info.architecture}
          </div>
          <div>
            Family: ${entity.attributes.status.node_info.operating_system}
          </div>
          <div>Image: ${entity.attributes.status.node_info.os_image}</div>
          <div>
            Kernel: ${entity.attributes.status.node_info.kernel_version}
          </div>
        </td>
      </tr>
    `;
  }

  renderKubernetes(entity) {
    if (!entity.attributes.status.node_info) return;
    return html`
      <tr>
        <th>Kubernetes</th>
        <td>
          <div>
            Kubelet Version:
            ${entity.attributes.status.node_info.kubelet_version}
          </div>
          <div>
            Container Runtime:
            ${entity.attributes.status.node_info.container_runtime_version}
          </div>
        </td>
      </tr>
    `;
  }

  renderReplicas(entity) {
    if (!entity.attributes.status.replicas) return;
    return html`
      <tr>
        <th>Replicas</th>
        <td>
          <div>Desired: ${entity.attributes.status.replicas}</div>
          <div>Ready: ${entity.attributes.status.ready_replicas}</div>
          <div>Updated: ${entity.attributes.status.updated_replicas}</div>
          <div>
            Unavailable:
            ${entity.attributes.status.unavailable_replicas
              ? entity.attributes.status.unavailable_replicas
              : 0}
          </div>
        </td>
      </tr>
    `;
  }

  renderSelector(entity) {
    if (!entity.attributes.spec.selector) return;
    return html`
      <tr>
        <th>Selector</th>
        <td>
          ${Object.entries(entity.attributes.spec.selector.match_labels).map(
            (label) => {
              return html`<div>${label.join("=")}</div>`;
            }
          )}
        </td>
      </tr>
    `;
  }

  renderStrategy(entity) {
    if (!entity.attributes.spec.strategy) return;
    return html`
      <tr>
        <th>Strategy</th>
        <td>
          <div>${entity.attributes.spec.strategy.type}</div>
        </td>
      </tr>
    `;
  }

  render() {
    var entity = this.hass.states[this.config.entity];

    console.log(entity);

    return html` <ha-card>
      <h1 class="card-header">${entity.attributes.kind}: ${getName(entity)}</h1>

      <table>
        ${entity.attributes.metadata
          ? html`
              ${this.renderNamespace(entity)}
              ${this.renderCreationTimestamp(entity)}
              ${this.renderLabels(entity)} ${this.renderAnnotations(entity)}
            `
          : html``}
        ${entity.attributes.status
          ? html`
              ${this.renderConditions(entity)} ${this.renderCapacity(entity)}
              ${this.renderAllocatable(entity)} ${this.renderAddresses(entity)}
              ${this.renderOS(entity)} ${this.renderKubernetes(entity)}
              ${this.renderReplicas(entity)}
            `
          : html``}
        ${entity.attributes.spec
          ? html`
              ${this.renderSelector(entity)} ${this.renderStrategy(entity)}
            `
          : html``}
      </table>
    </ha-card>`;
  }

  static get styles() {
    return css`
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      tr {
        border: solid;
        border-width: 1px 0;
      }
      tr:first-child {
        border-top: none;
      }
      tr:last-child {
        border-bottom: none;
      }
      th {
        text-align: left;
        padding: 10px 20px;
        color: var(--secondary-text-color);
        width: 20%;
      }
      div {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .success {
        color: var(--success-color);
      }
      .warning {
        color: var(--warning-color);
      }
      .error {
        color: var(--error-color);
      }
    `;
  }
}

customElements.define("k8s-component-details", ComponentDetailsCard);
