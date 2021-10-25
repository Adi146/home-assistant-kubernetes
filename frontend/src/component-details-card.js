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
      <tr class="section">
        <th>Namespace</th>
        <td colspan="2">
          <div>${getNamespace(entity)}</div>
        </td>
      </tr>
    `;
  }

  renderCreationTimestamp(entity) {
    if (!entity.attributes.metadata.creation_timestamp) return;
    return html`
      <tr class="section">
        <th>Created</th>
        <td colspan="2">
          <div>${entity.attributes.metadata.creation_timestamp}</div>
        </td>
      </tr>
    `;
  }

  renderLabels(entity) {
    if (!entity.attributes.metadata.labels) return;
    return html`
      <tr class="section">
        <th>Labels</th>
        <td colspan="2">
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
      <tr class="section">
        <th>Annotations</th>
        <td colspan="2">
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
    if (!entity.attributes.status.conditions) return;
    return html`
      <tr class="section">
        <th>Conditions</th>
        <td colspan="2">${getConditionsAsSpans(getConditions(entity))}</td>
      </tr>
    `;
  }

  renderCapacity(entity) {
    if (!entity.attributes.status.capacity) return;
    return html`
      <tr class="section">
        <th>Capicity</th>
        <td colspan="2">
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
      <tr class="section">
        <th>Allocatable</th>
        <td colspan="2">
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
      <tr class="section">
        <th>Addresses</th>
        <td colspan="2">
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
      <tr class="section">
        <th>OS</th>
        <td colspan="2">
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
      <tr class="section">
        <th>Kubernetes</th>
        <td colspan="2">
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
    if (
      !entity.attributes.status.replicas &&
      !entity.attributes.status.desired_number_scheduled
    )
      return;
    return html`
      <tr class="section">
        <th>Pods</th>
        <td colspan="2">
          <div>
            Desired:
            ${entity.attributes.status.replicas ??
            entity.attributes.status.desired_number_scheduled ??
            0}
          </div>
          <div>
            Ready:
            ${entity.attributes.status.ready_replicas ??
            entity.attributes.status.number_ready ??
            0}
          </div>
          <div>
            Updated:
            ${entity.attributes.status.updated_replicas ??
            entity.attributes.status.updated_number_scheduled ??
            0}
          </div>
          <div>
            Unavailable:
            ${entity.attributes.status.unavailable_replicas ??
            entity.attributes.status.number_unavailable ??
            0}
          </div>
        </td>
      </tr>
    `;
  }

  renderSelector(entity) {
    if (!entity.attributes.spec.selector) return;
    return html`
      <tr class="section">
        <th>Selector</th>
        <td colspan="2">
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
    if (
      !entity.attributes.spec.strategy &&
      !entity.attributes.spec.update_strategy
    )
      return;
    return html`
      <tr class="section">
        <th>Strategy</th>
        <td colspan="2">
          <div>
            ${entity.attributes.spec.strategy
              ? entity.attributes.spec.strategy.type
              : entity.attributes.spec.update_strategy.type}
          </div>
        </td>
      </tr>
    `;
  }

  renderNode(entity) {
    if (!entity.attributes.spec.node_name) return;
    return html`
      <tr class="section">
        <th>Node</th>
        <td colspan="2">
          <div>${entity.attributes.spec.node_name}</div>
        </td>
      </tr>
    `;
  }

  renderContainerStatus(entity) {
    if (!entity.attributes.status.container_statuses) return;
    return html`
      <tr class="section">
        <th rowspan="${entity.attributes.status.container_statuses}">
          Containers
        </th>
        ${entity.attributes.status.container_statuses.map(
          (container, index) => {
            var stateRow = html`
              <td>${container.name}</td>
              <td>
                <div>Image: ${container.image}</div>
                <div>Restart Counter: ${container.restart_count}</div>
                ${container.state.running
                  ? html`<div>
                      Start Time:
                      <span class="container_state success">
                        ${container.state.running.started_at}
                      </span>
                    </div>`
                  : html``}
                ${container.state.waiting
                  ? html`<div>
                      Wait Reason:
                      <span class="container_state error">
                        ${container.state.waiting.reason}
                      </span>
                    </div>`
                  : html``}
              </td>
            `;

            return html`
              ${index == 0
                ? stateRow
                : html`<tr>
                    ${stateRow}
                  </tr>`}
            `;
          }
        )}
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
              ${this.renderContainerStatus(entity)}
            `
          : html``}
        ${entity.attributes.spec
          ? html`
              ${this.renderSelector(entity)} ${this.renderStrategy(entity)}
              ${this.renderNode(entity)}
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
      .section {
        border-top: solid;
        border-width: 1px 0;
      }
      .section:first-child {
        border-top: none;
      }
      .section:last-child {
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
      .condition {
        border-radius: 25px;
        padding: 5px;
        margin: 2px 0px;
        display: inline-block;
      }
      .condition.success {
        background-color: var(--success-color);
      }
      .condition.warning {
        background-color: var(--warning-color);
      }
      .condition.error {
        background-color: var(--error-color);
      }
      .container_state.error {
        color: var(--error-color);
      }
    `;
  }
}

customElements.define("k8s-component-details", ComponentDetailsCard);
