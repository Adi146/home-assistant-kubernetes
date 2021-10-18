import { LitElement, html, css } from "lit";

import {
  getName,
  getNodeConditions,
  getNodeConditionsStateClass,
} from "./table-functions.js";

export class NodeCard extends LitElement {
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

  render() {
    var entity = this.hass.states[this.config.entity];
    var attributes = entity.attributes;

    console.log(attributes);

    return html` <ha-card>
      <h1 class="card-header">${getName(entity)}</h1>

      <table>
        <tr>
          <th>Created</th>
          <td>
            <div>${attributes.metadata.creation_timestamp}</div>
          </td>
        </tr>

        <tr>
          <th>Labels</th>
          <td>
            ${Object.entries(attributes.metadata.labels).map((label) => {
              var text = label.filter((val) => val != "").join("=");
              return html`<div title=${text}>${text}</div>`;
            })}
          </td>
        </tr>

        <tr>
          <th>Annotations</th>
          <td>
            ${Object.entries(attributes.metadata.annotations).map((label) => {
              var text = label.filter((val) => val != "").join("=");
              return html`<div title=${text}>${text}</div>`;
            })}
          </td>
        </tr>

        <tr>
          <th>Conditions</th>
          <td>
            <div class="${getNodeConditionsStateClass(entity)}">
              ${getNodeConditions(entity)}
            </div>
          </td>
        </tr>

        <tr>
          <th>Capicity</th>
          <td>
            <div>CPU: ${attributes.status.capacity.cpu}</div>
            <div>Memory: ${attributes.status.capacity.memory}</div>
            <div>Pods: ${attributes.status.capacity.pods}</div>
          </td>
        </tr>

        <tr>
          <th>Allocatable</th>
          <td>
            <div>CPU: ${attributes.status.allocatable.cpu}</div>
            <div>Memory: ${attributes.status.allocatable.memory}</div>
            <div>Pods: ${attributes.status.capacity.pods}</div>
          </td>
        </tr>

        <tr>
          <th>Addresses</th>
          <td>
            ${attributes.status.addresses.map((address) => {
              return html`<div>${address.type}: ${address.address}</div>`;
            })}
          </td>
        </tr>

        <tr>
          <th>OS</th>
          <td>
            <div>Architecture: ${attributes.status.node_info.architecture}</div>
            <div>Family: ${attributes.status.node_info.operating_system}</div>
            <div>Image: ${attributes.status.node_info.os_image}</div>
            <div>Kernel: ${attributes.status.node_info.kernel_version}</div>
          </td>
        </tr>

        <tr>
          <th>Kubernetes</th>
          <td>
            <div>
              Kubelet Version: ${attributes.status.node_info.kubelet_version}
            </div>
            <div>
              Container Runtime:
              ${attributes.status.node_info.container_runtime_version}
            </div>
          </td>
        </tr>
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

customElements.define("node-card", NodeCard);
